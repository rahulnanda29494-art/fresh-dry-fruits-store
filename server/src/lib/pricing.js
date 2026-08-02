const crypto = require('crypto');

const COUPONS = {
  FRESH10: 0.1,
};

// Recomputes order totals from trusted DB product records — never trust
// client-supplied prices/discount amounts.
async function priceCart(prisma, items, couponCode) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart is empty');
  }
  const slugs = items.map((i) => i.productSlug);
  const products = await prisma.product.findMany({ where: { slug: { in: slugs } } });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const lines = items.map((i) => {
    const product = bySlug.get(i.productSlug);
    if (!product) throw new Error(`Unknown product: ${i.productSlug}`);
    const qty = Math.max(1, Math.min(99, Math.floor(Number(i.qty) || 1)));
    return { product, qty, lineTotal: product.price * qty };
  });

  const subtotal = lines.reduce((t, l) => t + l.lineTotal, 0);
  const code = (couponCode || '').trim().toUpperCase();
  const rate = COUPONS[code] || 0;
  const discount = rate ? Math.round(subtotal * rate) : 0;
  const shipping = subtotal > 1499 || subtotal === 0 ? 0 : 79;
  const total = subtotal - discount + shipping;

  return { lines, subtotal, discount, shipping, total, couponCode: rate ? code : null };
}

// Customer-facing reference shown as "#FDF-…". Ten digits keeps it readable
// while making collisions against the unique index vanishingly rare — the old
// five-digit space had ~90k values, so a few thousand orders in it collided
// routinely. This is an identifier, not a secret: never let it grant access.
function generateOrderNo() {
  return String(crypto.randomInt(1_000_000_000, 10_000_000_000));
}

// Bearer capability for the guest confirmation lookup — 256 bits, so it cannot
// be enumerated the way an order number can.
function generatePublicToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = { priceCart, generateOrderNo, generatePublicToken, COUPONS };
