const express = require('express');
const prisma = require('../lib/prisma');
const { razorpay, keyId } = require('../lib/razorpay');
const { priceCart } = require('../lib/pricing');
const { attachUser } = require('../middleware/auth');

const router = express.Router();

// Lets the frontend know whether the gateway is live and which public key to
// open Razorpay Checkout with. key_id is publishable (safe to expose); the
// secret never leaves the server.
router.get('/config', (_req, res) => {
  res.json({ razorpayEnabled: Boolean(razorpay), keyId });
});

// Creates a Razorpay Order for the UPI / card step of checkout. The amount is
// derived server-side from the cart, never trusted from the client. The
// returned razorpayOrderId is what the client opens Razorpay Checkout with.
router.post('/create-razorpay-order', attachUser, async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ error: 'Online payments are not configured on this server (missing Razorpay keys). Cash on Delivery is still available.' });
  }
  try {
    const { items, couponCode } = req.body;
    const { total } = await priceCart(prisma, items, couponCode);
    if (total <= 0) return res.status(400).json({ error: 'Nothing to charge' });

    const order = await razorpay.orders.create({
      amount: total * 100, // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: req.user?.sub || 'guest' },
    });
    res.json({ razorpayOrderId: order.id, amount: order.amount, currency: order.currency, keyId, total });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
