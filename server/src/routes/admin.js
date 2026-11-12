const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { attachUser, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../lib/asyncHandler');

const router = express.Router();

// ---- Product management (admin-only) ------------------------------------
function slugify(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

const productCreateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().max(80).optional(),
  category: z.string().trim().min(1).max(80),
  price: z.number().int().nonnegative(),
  oldPrice: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative().default(0),
  weight: z.string().trim().max(40).optional(),
  origin: z.string().trim().max(120).optional(),
  blurb: z.string().trim().max(600).optional(),
  badge: z.string().trim().max(40).optional(),
  image: z.string().trim().max(120).optional(),
  organic: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  benefits: z.array(z.string()).optional(),
  nutrition: z.record(z.string()).optional(),
});

const productUpdateSchema = productCreateSchema.partial();

router.get('/products', attachUser, requireAdmin, asyncHandler(async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } });
  res.json(products.map((p) => ({ id: p.id, slug: p.slug, name: p.name, category: p.category, price: p.price, oldPrice: p.oldPrice, stock: p.stock, weight: p.weight, badge: p.badge || '', organic: p.organic, bestSeller: p.bestSeller, image: p.image || '', origin: p.origin })));
}));

router.post('/products', attachUser, requireAdmin, asyncHandler(async (req, res) => {
  const parsed = productCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  const slug = d.slug ? slugify(d.slug) : slugify(d.name);
  if (await prisma.product.findUnique({ where: { slug } })) return res.status(409).json({ error: 'A product with this slug already exists' });
  const product = await prisma.product.create({
    data: {
      slug, name: d.name, category: d.category, price: d.price, oldPrice: d.oldPrice ?? d.price,
      rating: 0, reviews: 0, weight: d.weight || '', badge: d.badge || null, organic: d.organic ?? false,
      origin: d.origin || '', blurb: d.blurb || '', benefits: d.benefits || [], nutrition: d.nutrition || {},
      image: d.image || '', bestSeller: d.bestSeller ?? false, stock: d.stock,
    },
  });
  res.status(201).json({ id: product.id, slug: product.slug });
}));

router.patch('/products/:id', attachUser, requireAdmin, asyncHandler(async (req, res) => {
  const parsed = productUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const data = { ...parsed.data };
  if (data.slug) data.slug = slugify(data.slug);
  const exists = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!exists) return res.status(404).json({ error: 'Product not found' });
  const product = await prisma.product.update({ where: { id: req.params.id }, data });
  res.json({ id: product.id, slug: product.slug, stock: product.stock, price: product.price });
}));

router.delete('/products/:id', attachUser, requireAdmin, asyncHandler(async (req, res) => {
  const ordered = await prisma.orderItem.count({ where: { productId: req.params.id } });
  if (ordered > 0) return res.status(409).json({ error: 'This product has orders and cannot be deleted. Set its stock to 0 to hide it instead.' });
  await prisma.product.delete({ where: { id: req.params.id } }).catch(() => {});
  res.json({ ok: true });
}));

// Seller dashboard data: every order across all customers, plus summary totals.
// Admin-only (ADMIN_EMAILS) — never exposed to regular shoppers.
router.get('/orders', attachUser, requireAdmin, asyncHandler(async (_req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } }, user: true },
  });

  const paidStatuses = ['paid', 'test-paid', 'cod'];
  const totalRevenue = orders.reduce((t, o) => t + o.total, 0);
  const summary = {
    totalOrders: orders.length,
    totalRevenue,
    paidRevenue: orders.filter((o) => paidStatuses.includes(o.paymentStatus)).reduce((t, o) => t + o.total, 0),
    avgOrderValue: orders.length ? Math.round(totalRevenue / orders.length) : 0,
    totalItems: orders.reduce((t, o) => t + o.items.reduce((s, i) => s + i.qty, 0), 0),
    byMethod: orders.reduce((m, o) => { m[o.paymentMethod] = (m[o.paymentMethod] || 0) + 1; return m; }, {}),
    byMethodRevenue: orders.reduce((m, o) => { m[o.paymentMethod] = (m[o.paymentMethod] || 0) + o.total; return m; }, {}),
    byStatus: orders.reduce((m, o) => { m[o.status] = (m[o.status] || 0) + 1; return m; }, {}),
  };

  res.json({ summary, orders: orders.map(serializeAdminOrder) });
}));

// Update an order's fulfillment status (e.g. mark it shipped). Admin-only.
const FULFILMENT_STATUSES = ['confirmed', 'shipped', 'delivered', 'cancelled'];
router.patch('/orders/:orderNo/status', attachUser, requireAdmin, asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!FULFILMENT_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${FULFILMENT_STATUSES.join(', ')}` });
  }
  const existing = await prisma.order.findUnique({ where: { orderNo: req.params.orderNo } });
  if (!existing) return res.status(404).json({ error: 'Order not found' });

  const order = await prisma.order.update({
    where: { orderNo: req.params.orderNo },
    data: { status },
  });
  res.json({ orderNo: order.orderNo, status: order.status });
}));

function serializeAdminOrder(o) {
  const addr = o.shippingAddress || {};
  return {
    orderNo: o.orderNo,
    createdAt: o.createdAt,
    status: o.status,
    customerName: o.user ? o.user.name : (o.guestName || addr.fullName || '—'),
    customerEmail: o.user ? o.user.email : (o.guestEmail || '—'),
    isGuest: !o.user,
    phone: addr.phone || '—',
    address: [addr.line1, addr.city, addr.pin].filter(Boolean).join(', ') || '—',
    fullAddress: addr,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    paymentRef: o.razorpayPaymentId || o.razorpayOrderId || null,
    subtotal: o.subtotal,
    discount: o.discount,
    shipping: o.shipping,
    total: o.total,
    couponCode: o.couponCode,
    items: o.items.map((i) => ({ name: i.product.name, weight: i.product.weight, qty: i.qty, unitPrice: i.unitPrice })),
  };
}

module.exports = router;
