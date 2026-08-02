const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PRODUCTS = [
  { slug: 'almonds', name: 'California Premium Almonds', category: 'Almonds', price: 899, oldPrice: 1099, rating: 4.8, reviews: 342, weight: '500 g', badge: 'Bestseller', organic: true, image: 'almonds.jpg', bestSeller: true,
    blurb: 'Plump, sweet Nonpareil almonds — sun-dried and cold-sorted for uniform size and an unmistakable crunch.',
    origin: 'California, USA', benefits: ['Heart health', 'Vitamin E', 'Good fats'],
    nutrition: { Energy: '579 kcal', Protein: '21 g', Fat: '50 g', Fibre: '12 g', Carbs: '22 g' } },
  { slug: 'cashews', name: 'Kashmiri Roasted Cashews W240', category: 'Cashews', price: 1249, oldPrice: 1499, rating: 4.9, reviews: 218, weight: '500 g', badge: 'Premium', organic: false, image: 'cashews.jpg', bestSeller: true,
    blurb: 'Grade W240 whole cashews, gently roasted to bring out their natural butteriness. Impossibly creamy.',
    origin: 'Mangalore, India', benefits: ['Magnesium', 'Zinc', 'Antioxidants'],
    nutrition: { Energy: '553 kcal', Protein: '18 g', Fat: '44 g', Fibre: '3 g', Carbs: '30 g' } },
  { slug: 'pistachios', name: 'Iranian Salted Pistachios', category: 'Pistachios', price: 1099, oldPrice: 1299, rating: 4.7, reviews: 176, weight: '500 g', badge: 'New', organic: false, image: 'pistachios.jpg', bestSeller: false,
    blurb: 'Long, jade-green Akbari pistachios with a delicate salt cure. Naturally split, always fresh.',
    origin: 'Kerman, Iran', benefits: ['Protein', 'Lutein', 'Fibre'],
    nutrition: { Energy: '562 kcal', Protein: '20 g', Fat: '45 g', Fibre: '10 g', Carbs: '28 g' } },
  { slug: 'walnuts', name: 'Kashmiri Walnut Kernels', category: 'Walnuts', price: 1349, oldPrice: 1599, rating: 4.8, reviews: 143, weight: '500 g', badge: '', organic: true, image: 'walnuts.jpeg', bestSeller: false,
    blurb: 'Light-halves from high-altitude Kashmiri orchards — buttery, low-tannin and rich in omega-3.',
    origin: 'Kashmir, India', benefits: ['Omega-3', 'Brain health', 'Antioxidants'],
    nutrition: { Energy: '654 kcal', Protein: '15 g', Fat: '65 g', Fibre: '7 g', Carbs: '14 g' } },
  { slug: 'dates', name: 'Royal Medjool Dates', category: 'Dates', price: 749, oldPrice: 899, rating: 4.9, reviews: 401, weight: '500 g', badge: 'Bestseller', organic: true, image: 'dates.jpeg', bestSeller: true,
    blurb: "Giant, caramel-soft Medjool dates with a honeyed finish. Nature's sweet without a grain of added sugar.",
    origin: 'Jordan Valley', benefits: ['Natural energy', 'Potassium', 'Fibre'],
    nutrition: { Energy: '277 kcal', Protein: '2 g', Fat: '0.2 g', Fibre: '7 g', Carbs: '75 g' } },
  { slug: 'raisins', name: 'Golden Seedless Raisins', category: 'Berries', price: 449, oldPrice: 549, rating: 4.6, reviews: 289, weight: '500 g', badge: '', organic: true, image: 'raisins.jpeg', bestSeller: false,
    blurb: "Sun-golden Kishmish, plump and jammy. The pantry staple that's never dry, never sticky.",
    origin: 'Nashik, India', benefits: ['Iron', 'Digestion', 'Antioxidants'],
    nutrition: { Energy: '299 kcal', Protein: '3 g', Fat: '0.5 g', Fibre: '4 g', Carbs: '79 g' } },
  { slug: 'figs', name: 'Turkish Dried Figs (Anjeer)', category: 'Figs', price: 899, oldPrice: 1049, rating: 4.7, reviews: 132, weight: '400 g', badge: '', organic: false, image: 'figs.jpeg', bestSeller: false,
    blurb: 'Soft Lerida figs, sun-dried whole. Delicately sweet with that signature seedy crunch.',
    origin: 'Aydin, Turkey', benefits: ['Calcium', 'Fibre', 'Iron'],
    nutrition: { Energy: '249 kcal', Protein: '3 g', Fat: '1 g', Fibre: '10 g', Carbs: '64 g' } },
  { slug: 'apricots', name: 'Turkish Dried Apricots', category: 'Apricots', price: 799, oldPrice: 949, rating: 4.6, reviews: 98, weight: '500 g', badge: '', organic: true, image: '', bestSeller: false,
    blurb: 'Whole, unsulphured Malatya apricots — tangy-sweet and beautifully chewy. Nothing added.',
    origin: 'Malatya, Turkey', benefits: ['Vitamin A', 'Potassium', 'Fibre'],
    nutrition: { Energy: '241 kcal', Protein: '3 g', Fat: '0.5 g', Fibre: '7 g', Carbs: '63 g' } },
  { slug: 'mixed', name: 'Royal Mixed Nuts Deluxe', category: 'Gift Boxes', price: 1499, oldPrice: 1799, rating: 4.9, reviews: 512, weight: '750 g', badge: 'Bestseller', organic: false, image: 'gift-box.jpg', bestSeller: true,
    blurb: 'A curated medley of almonds, cashews, pistachios and walnuts. The everyday luxury for the whole family.',
    origin: 'Assorted origins', benefits: ['Balanced nutrition', 'Protein', 'Good fats'],
    nutrition: { Energy: '607 kcal', Protein: '19 g', Fat: '54 g', Fibre: '8 g', Carbs: '20 g' } },
];

async function main() {
  for (const p of PRODUCTS) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: p, create: p });
  }
  console.log(`Seeded ${PRODUCTS.length} products.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
