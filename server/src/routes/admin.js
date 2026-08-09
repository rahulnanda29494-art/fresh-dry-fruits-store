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
  const summary = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((t, o) => t + o.total, 0),
    paidRevenue: orders.filter((o) => paidStatuses.includes(o.paymentStatus)).reduce((t, o) => t + o.total, 0),
    totalItems: orders.reduce((t, o) => t + o.items.reduce((s, i) => s + i.qty, 0), 0),
    byMethod: orders.reduce((m, o) => { m[o.paymentMethod] = (m[o.paymentMethod] || 0) + 1; return m; }, {}),
  };

  res.json({ summary, orders: orders.map(serializeAdminOrder) });
}));

function serializeAdminOrder(o) {
  const addr = o.shippingAddress || {};
  return {
    orderNo: o.orderNo,
    createdAt: o.createdAt,
    customerName: o.user ? o.user.name : (o.guestName || addr.fullName || '—'),
    customerEmail: o.user ? o.user.email : (o.guestEmail || '—'),
    isGuest: !o.user,
    phone: addr.phone || '—',
    address: [addr.line1, addr.city, addr.pin].filter(Boolean).join(', ') || '—',
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
