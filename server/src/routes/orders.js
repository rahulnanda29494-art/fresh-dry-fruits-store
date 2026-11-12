const crypto = require('crypto');
const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { razorpay, keySecret } = require('../lib/razorpay');
const { priceCart, generateOrderNo, generatePublicToken } = require('../lib/pricing');
const { attachUser, requireUser } = require('../middleware/auth');
const { sendMail } = require('../lib/mailer');
const asyncHandler = require('../lib/asyncHandler');

const router = express.Router();

const addressSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(6).max(20),
  line1: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  pin: z.string().trim().min(3).max(12),
});

const orderSchema = z.object({
  items: z.array(z.object({ productSlug: z.string(), qty: z.number().int().positive() })).min(1),
  couponCode: z.string().optional(),
  address: addressSchema,
  paymentMethod: z.enum(['card', 'upi', 'cod']),
  // Razorpay Checkout handles both UPI and card; on success it returns these.
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  guestEmail: z.string().email().optional(),
});

// Verifies a Razorpay Checkout result server-side: the HMAC signature proves
// the payment belongs to our order, then we re-fetch the payment to confirm it
// was actually captured for the exact amount (never trust the client).
async function verifyRazorpayPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, expectedAmountPaise) {
  if (!razorpay) throw { code: 503, msg: 'Online payments are not configured on this server.' };
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw { code: 400, msg: 'Missing payment confirmation details' };
  }
  const expectedSig = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  if (expectedSig !== razorpaySignature) {
    throw { code: 400, msg: 'Payment signature verification failed' };
  }
  const payment = await razorpay.payments.fetch(razorpayPaymentId);
  if (payment.order_id !== razorpayOrderId) {
    throw { code: 400, msg: 'Payment does not match this order' };
  }
  if (!['captured', 'authorized'].includes(payment.status)) {
    throw { code: 402, msg: 'Payment has not been completed' };
  }
  if (payment.amount !== expectedAmountPaise) {
    throw { code: 400, msg: 'Payment amount does not match cart total' };
  }
  return payment;
}

router.post('/', attachUser, asyncHandler(async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { items, couponCode, address, paymentMethod, razorpayOrderId, razorpayPaymentId, razorpaySignature, guestEmail } = parsed.data;

  let priced;
  try {
    priced = await priceCart(prisma, items, couponCode);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  // UPI and card both settle through Razorpay Checkout; COD is recorded for
  // collection on delivery.
  let paymentStatus = 'pending';
  if (paymentMethod === 'card' || paymentMethod === 'upi') {
    if (razorpay) {
      // Live gateway configured — verify the real Razorpay payment.
      try {
        await verifyRazorpayPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, priced.total * 100);
      } catch (e) {
        return res.status(e.code || 400).json({ error: e.msg || 'Payment verification failed' });
      }
      paymentStatus = 'paid';
    } else {
      // No Razorpay keys set — record a simulated payment so checkout works in
      // dev. Add RAZORPAY_KEY_ID/SECRET to switch this to real charging.
      paymentStatus = 'test-paid';
    }
  } else if (paymentMethod === 'cod') {
    paymentStatus = 'cod';
  }

  const order = await createOrderRow({
    priced,
    address,
    paymentMethod,
    paymentStatus,
    razorpayOrderId,
    razorpayPaymentId,
    user: req.user,
    guestEmail,
  });

  // Email the customer a confirmation (no-op unless SMTP is configured).
  const toEmail = req.user ? req.user.email : guestEmail;
  if (toEmail) sendOrderConfirmation(toEmail, serializeOrder(order), address).catch((e) => console.error('[order-email]', e.message));

  // publicToken is returned only here, to the person who placed the order — it
  // is their key to the confirmation lookup and is never listed elsewhere.
  res.status(201).json({ ...serializeOrder(order), publicToken: order.publicToken });
}));

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

async function sendOrderConfirmation(to, order, address) {
  const rows = order.items.map((i) => `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${i.qty} × ${esc(i.name)}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">${inr(i.unitPrice * i.qty)}</td></tr>`).join('');
  const payLine = order.paymentStatus === 'cod' ? 'Cash on Delivery' : `${(order.paymentMethod || '').toUpperCase()} · ${order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#2a1f12">
    <h2 style="color:#6A4E2F;margin:0 0 4px">Fresh Dry Fruits</h2>
    <p style="color:#8a7a63;margin:0 0 18px;font-size:13px">Order confirmed 🌰</p>
    <p>Hi ${esc(address.fullName || 'there')}, thanks for your order! We've received it and will get it on its way.</p>
    <p style="font-size:15px"><b>Order #FDF-${esc(order.orderNo)}</b></p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:8px">
      <tr><td style="padding:3px 0">Subtotal</td><td style="text-align:right">${inr(order.subtotal)}</td></tr>
      ${order.discount > 0 ? `<tr><td style="padding:3px 0">Discount${order.couponCode ? ' (' + esc(order.couponCode) + ')' : ''}</td><td style="text-align:right">-${inr(order.discount)}</td></tr>` : ''}
      <tr><td style="padding:3px 0">Shipping</td><td style="text-align:right">${order.shipping === 0 ? 'FREE' : inr(order.shipping)}</td></tr>
      <tr><td style="padding:8px 0;font-weight:bold;border-top:2px solid #6A4E2F">Total</td><td style="text-align:right;font-weight:bold;border-top:2px solid #6A4E2F">${inr(order.total)}</td></tr>
    </table>
    <p style="font-size:13px;color:#6c5c47;margin-top:16px">Payment: ${esc(payLine)}<br>Delivering to: ${esc([address.line1, address.city, address.pin].filter(Boolean).join(', '))}</p>
    <p style="font-size:12px;color:#a08a63;margin-top:22px;border-top:1px dashed #ddd;padding-top:12px">Questions? Just reply to this email. Thank you for shopping with Fresh Dry Fruits.</p>
  </div>`;
  const text = `Order confirmed — #FDF-${order.orderNo}\n\n${order.items.map((i) => `${i.qty} x ${i.name} — ${inr(i.unitPrice * i.qty)}`).join('\n')}\n\nTotal: ${inr(order.total)}\nPayment: ${payLine}\n\nThank you for shopping with Fresh Dry Fruits.`;
  await sendMail({ to, subject: `Order confirmed — #FDF-${order.orderNo}`, html, text });
}

// orderNo is random, so a fresh one can still land on an existing row; retry a
// few times rather than failing a checkout that has already been paid for.
async function createOrderRow({ priced, address, paymentMethod, paymentStatus, razorpayOrderId, razorpayPaymentId, user, guestEmail }) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      // Create the order and decrement product stock in one transaction so the
      // two can't drift apart.
      return await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            orderNo: generateOrderNo(),
            publicToken: generatePublicToken(),
            userId: user?.sub || null,
            guestEmail: user ? null : (guestEmail || null),
            guestName: user ? null : address.fullName,
            shippingAddress: address,
            paymentMethod,
            paymentStatus,
            razorpayOrderId: paymentStatus === 'paid' ? razorpayOrderId : null,
            razorpayPaymentId: paymentStatus === 'paid' ? razorpayPaymentId : null,
            couponCode: priced.couponCode,
            subtotal: priced.subtotal,
            discount: priced.discount,
            shipping: priced.shipping,
            total: priced.total,
            items: {
              create: priced.lines.map((l) => ({ productId: l.product.id, qty: l.qty, unitPrice: l.product.price })),
            },
          },
          include: { items: { include: { product: true } } },
        });
        for (const l of priced.lines) {
          await tx.product.update({ where: { id: l.product.id }, data: { stock: { decrement: l.qty } } });
        }
        return created;
      });
    } catch (err) {
      const collided = err.code === 'P2002' && [].concat(err.meta?.target || []).includes('orderNo');
      if (!collided || attempt === 4) throw err;
    }
  }
}

// Lists the signed-in user's orders, newest first. Guest orders have no
// account to hang off, so they're only reachable by their publicToken below.
router.get('/', attachUser, requireUser, asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.sub },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } } },
  });
  res.json(orders.map(serializeOrder));
}));

// Confirmation lookup. Guest checkout has no account to authenticate against,
// so the token issued at creation time is what proves the caller placed this
// order. Declared before /:orderNo so the two-segment path wins.
router.get('/by-token/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!/^[a-f0-9]{64}$/.test(token)) return res.status(404).json({ error: 'Order not found' });

  const order = await prisma.order.findUnique({
    where: { publicToken: token },
    include: { items: { include: { product: true } } },
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(serializeOrder(order));
}));

// Order-number lookup is for account holders only, and only for their own
// orders. Someone else's order number returns 404 rather than 403 so this
// can't be used to probe which numbers exist.
router.get('/:orderNo', attachUser, requireUser, asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { orderNo: req.params.orderNo },
    include: { items: { include: { product: true } } },
  });
  if (!order || order.userId !== req.user.sub) return res.status(404).json({ error: 'Order not found' });
  res.json(serializeOrder(order));
}));

function serializeOrder(order) {
  return {
    orderNo: order.orderNo,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total,
    couponCode: order.couponCode,
    createdAt: order.createdAt,
    items: order.items.map((i) => ({ name: i.product.name, slug: i.product.slug, qty: i.qty, unitPrice: i.unitPrice })),
  };
}

module.exports = router;
