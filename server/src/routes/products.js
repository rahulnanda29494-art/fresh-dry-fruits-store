const express = require('express');
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');

const router = express.Router();

function serialize(p) {
  return {
    id: p.slug,
    name: p.name,
    category: p.category,
    price: p.price,
    oldPrice: p.oldPrice,
    rating: p.rating,
    reviews: p.reviews,
    weight: p.weight,
    badge: p.badge || '',
    organic: p.organic,
    origin: p.origin,
    blurb: p.blurb,
    benefits: p.benefits,
    nutrition: p.nutrition,
    image: p.image || '',
    bestSeller: p.bestSeller,
  };
}

router.get('/', asyncHandler(async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } });
  res.json(products.map(serialize));
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { slug: req.params.slug } });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(serialize(product));
}));

module.exports = router;
