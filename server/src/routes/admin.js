const express = require('express');
const prisma = require('../lib/prisma');
const { attachUser, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../lib/asyncHandler');

const router = express.Router();

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
    subtotal: o.subtotal,
    discount: o.discount,
    shipping: o.shipping,
    total: o.total,
    couponCode: o.couponCode,
    items: o.items.map((i) => ({ name: i.product.name, qty: i.qty, unitPrice: i.unitPrice })),
  };
}

module.exports = router;
