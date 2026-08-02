import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import { money, stars } from '../utils/format';
import { TESTIMONIALS } from '../data/content';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const cart = useCart();
  const wishlist = useWishlist();
  const [qty, setQty] = useState(1);
  const [openTab, setOpenTab] = useState('desc');

  const product = products.find((p) => p.id === slug);

  if (loading) return null;
  if (!product) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '90px 32px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, color: '#2a1f12' }}>Product not found</h1>
        <button onClick={() => navigate('/shop')} style={{ marginTop: 20, fontFamily: 'Montserrat,sans-serif', fontWeight: 600, background: '#6A4E2F', color: '#fff', border: 'none', padding: '12px 26px', borderRadius: 100, cursor: 'pointer' }}>Back to shop</button>
      </div>
    );
  }

  const disc = Math.round((1 - product.price / product.oldPrice) * 100);
  const isWished = wishlist.has(product.id);
  const related = products.filter((p) => p.id !== product.id && p.category === product.category)
    .concat(products.filter((p) => p.id !== product.id))
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .slice(0, 4);

  const tabs = [
    { key: 'desc', label: 'Description', content: product.blurb + ' Every batch is quality-checked in-house before packing, sealed for freshness, and shipped within 24 hours of your order.' },
    { key: 'nutrition', label: 'Nutrition Facts (per 100g)', content: '' },
    { key: 'reviews', label: `Reviews (${product.reviews})`, content: `"${TESTIMONIALS[0].text}" — verified buyer, 5★. Join thousands of happy customers who reorder every month.` },
  ];

  return (
    <div>
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '36px 32px 0' }}>
        <div style={{ fontSize: 12.5, color: '#8a7a63' }}>
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span style={{ color: '#6A4E2F' }}>{product.name}</span>
        </div>
      </section>
      <section className="grid-2-to-1" style={{ maxWidth: 1360, margin: '0 auto', padding: '28px 32px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }}>
        <div>
          <div style={{ borderRadius: 24, overflow: 'hidden', aspectRatio: '1', boxShadow: '0 20px 50px rgba(106,78,47,.15)' }}>
            <ProductImage imageKey={product.image} alt={product.name} label={product.name} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 14 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '1', border: '2px solid rgba(106,78,47,.1)', cursor: 'pointer' }}>
                <ProductImage imageKey={product.image} alt={`${product.name} ${i}`} label={`${product.name} ${i}`} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 11.5, letterSpacing: '.16em', color: '#B08D3E', fontWeight: 600 }}>{product.category.toUpperCase()}</span>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 38, fontWeight: 700, color: '#2a1f12', margin: '10px 0 0', lineHeight: 1.15 }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <span style={{ color: '#D4AF37', letterSpacing: '2px' }}>{stars(product.rating)}</span>
            <span style={{ fontSize: 13, color: '#8a7a63' }}>{product.rating} ({product.reviews} reviews)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 20 }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, color: '#6A4E2F' }}>{money(product.price)}</span>
            <span style={{ textDecoration: 'line-through', color: '#b0a288', fontSize: 18 }}>{money(product.oldPrice)}</span>
            {disc > 0 && <span style={{ background: '#EA4335', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100 }}>−{disc}%</span>}
          </div>
          <p style={{ color: '#6c5c47', fontSize: 15, lineHeight: 1.75, margin: '22px 0 0', maxWidth: 480 }}>{product.blurb}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
            {product.benefits.map((b) => (
              <span key={b} style={{ background: '#EAF3DC', color: '#4a6b2a', fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 100 }}>✓ {b}</span>
            ))}
          </div>
          <div style={{ fontSize: 13, color: '#8a7a63', marginTop: 16 }}>Origin: <b style={{ color: '#4a3a26' }}>{product.origin}</b> &nbsp;·&nbsp; Pack size: <b style={{ color: '#4a3a26' }}>{product.weight}</b></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid rgba(106,78,47,.25)', borderRadius: 100, overflow: 'hidden' }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ border: 'none', background: 'none', width: 44, height: 48, cursor: 'pointer', fontSize: 18, color: '#6A4E2F' }}>−</button>
              <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} style={{ border: 'none', background: 'none', width: 44, height: 48, cursor: 'pointer', fontSize: 18, color: '#6A4E2F' }}>+</button>
            </div>
            <button onClick={() => cart.addToCart(product.id, qty)} style={{ flex: 1, fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14.5, background: '#6A4E2F', color: '#fff', border: 'none', padding: 16, borderRadius: 100, cursor: 'pointer', boxShadow: '0 14px 30px rgba(106,78,47,.3)' }}>
              Add to Cart · {money(product.price)}
            </button>
            <button onClick={() => wishlist.toggle(product.id)} title="Wishlist" style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', border: '1.5px solid rgba(106,78,47,.2)', cursor: 'pointer', fontSize: 18, color: '#EA4335' }}>
              {isWished ? '♥' : '♡'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 22, marginTop: 26, fontSize: 12.5, color: '#8a7a63' }}>
            <span>🚚 Free shipping over ₹1499</span><span>↩ 7-day returns</span><span>🔒 Secure checkout</span>
          </div>

          <div style={{ marginTop: 38, borderTop: '1px solid rgba(106,78,47,.12)' }}>
            {tabs.map((t) => (
              <div key={t.key}>
                <button
                  onClick={() => setOpenTab(openTab === t.key ? '' : t.key)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderTop: '1px solid rgba(106,78,47,.12)', padding: '18px 4px', fontFamily: 'Montserrat,sans-serif', fontWeight: 600, fontSize: 14, color: '#2a1f12', cursor: 'pointer' }}
                >
                  {t.label} <span style={{ float: 'right' }}>{openTab === t.key ? '−' : '+'}</span>
                </button>
                {openTab === t.key && t.key !== 'nutrition' && (
                  <div style={{ padding: '0 4px 22px', color: '#6c5c47', fontSize: 14, lineHeight: 1.8 }}>{t.content}</div>
                )}
                {openTab === 'nutrition' && t.key === 'nutrition' && (
                  <div style={{ padding: '0 4px 22px', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
                    {Object.entries(product.nutrition).map(([k, v]) => (
                      <div key={k} style={{ textAlign: 'center', background: '#F5EFE2', borderRadius: 12, padding: '12px 6px' }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#6A4E2F', fontSize: 15 }}>{v}</div>
                        <div style={{ fontSize: 10.5, color: '#8a7a63', marginTop: 3 }}>{k}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1360, margin: '20px auto 90px', padding: '0 32px' }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#2a1f12', marginBottom: 24 }}>You may also like</h2>
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
