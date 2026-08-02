import { useNavigate } from 'react-router-dom';
import { useQuickView } from '../context/QuickViewContext';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import ProductImage from './ProductImage';
import { money, stars } from '../utils/format';

export default function QuickView() {
  const quickView = useQuickView();
  const { bySlug } = useProducts();
  const cart = useCart();
  const navigate = useNavigate();

  const product = quickView.quickId ? bySlug(quickView.quickId) : null;
  if (!product) return null;

  function stop(e) { e.stopPropagation(); }
  function add() { cart.addToCart(product.id, 1); quickView.close(); }
  function full() { const id = product.id; quickView.close(); navigate(`/product/${id}`); }

  return (
    <div
      onClick={quickView.close}
      style={{
        position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(26,20,12,.55)',
        backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', padding: 24,
      }}
    >
      <div onClick={stop} style={{ background: '#fff', borderRadius: 24, maxWidth: 900, width: '100%', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', boxShadow: '0 40px 90px rgba(0,0,0,.4)', position: 'relative' }}>
        <button onClick={quickView.close} style={{ position: 'absolute', top: 16, right: 16, zIndex: 2, background: 'rgba(255,255,255,.9)', border: 'none', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', fontSize: 18, color: '#6A4E2F' }}>✕</button>
        <div style={{ position: 'relative', minHeight: 420, background: '#F5EFE2' }}>
          <ProductImage imageKey={product.image} alt={product.name} label={product.name} />
        </div>
        <div style={{ padding: 40 }}>
          <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 11, letterSpacing: '.16em', color: '#B08D3E', fontWeight: 600 }}>{product.category.toUpperCase()}</span>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: '#2a1f12', margin: '8px 0 0' }}>{product.name}</h3>
          <div style={{ color: '#D4AF37', letterSpacing: '2px', marginTop: 8, fontSize: 14 }}>
            {stars(product.rating)} <span style={{ color: '#8a7a63', fontSize: 12, letterSpacing: 0 }}>({product.reviews} reviews)</span>
          </div>
          <p style={{ color: '#6c5c47', fontSize: 14, lineHeight: 1.7, margin: '16px 0 0' }}>{product.blurb}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '22px 0' }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#6A4E2F' }}>{money(product.price)}</span>
            <span style={{ textDecoration: 'line-through', color: '#b0a288', fontSize: 16 }}>{money(product.oldPrice)}</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={add} style={{ flex: 1, fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 14, background: '#6A4E2F', color: '#fff', border: 'none', padding: 15, borderRadius: 100, cursor: 'pointer' }}>
              Add to Cart
            </button>
            <button onClick={full} style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 600, fontSize: 14, background: '#fff', color: '#6A4E2F', border: '1.5px solid rgba(106,78,47,.3)', padding: '15px 22px', borderRadius: 100, cursor: 'pointer' }}>
              Full details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
