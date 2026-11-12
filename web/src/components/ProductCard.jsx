import { useNavigate } from 'react-router-dom';
import ProductImage from './ProductImage';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useQuickView } from '../context/QuickViewContext';
import { money, stars } from '../utils/format';

export default function ProductCard({ product: p }) {
  const navigate = useNavigate();
  const wishlist = useWishlist();
  const cart = useCart();
  const quickView = useQuickView();

  const disc = Math.round((1 - p.price / p.oldPrice) * 100);
  const hasDisc = disc > 0;
  const isWished = wishlist.has(p.id);
  const soldOut = p.stock != null && p.stock <= 0;

  function onOpen() { navigate(`/product/${p.id}`); }
  function onAdd(e) { e.stopPropagation(); if (soldOut) return; cart.addToCart(p.id, 1); }
  function onWish(e) { e.stopPropagation(); wishlist.toggle(p.id); }
  function onQuick(e) { e.stopPropagation(); quickView.open(p.id); }

  return (
    <div
      className="product-card"
      onClick={onOpen}
      style={{
        position: 'relative', background: '#fff', border: '1px solid rgba(106,78,47,.09)',
        borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
        transition: 'transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '1', background: '#F5EFE2', overflow: 'hidden', opacity: soldOut ? 0.72 : 1 }}>
        <ProductImage imageKey={p.image} alt={p.name} label={p.name} />
        {soldOut && (
          <span style={{ position: 'absolute', top: 12, right: 12, background: '#1A1A1A', color: '#fff', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '.08em', padding: '5px 10px', borderRadius: 100, zIndex: 2 }}>OUT OF STOCK</span>
        )}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'none' }}>
          {hasDisc && (
            <span style={{ background: '#EA4335', color: '#fff', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 11, padding: '4px 9px', borderRadius: 100 }}>
              −{disc}%
            </span>
          )}
          {p.badge && (
            <span style={{ background: '#1A1A1A', color: '#D4AF37', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '.08em', padding: '4px 9px', borderRadius: 100 }}>
              {p.badge}
            </span>
          )}
        </div>
        <button
          onClick={onWish}
          title="Wishlist"
          style={{
            position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,.92)', border: 'none', cursor: 'pointer', fontSize: 16,
            color: '#EA4335', display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.12)',
          }}
        >
          {isWished ? '♥' : '♡'}
        </button>
        <div className="product-card-actions" style={{ position: 'absolute', left: 12, right: 12, bottom: 12, display: 'flex', gap: 8 }}>
          <button
            onClick={onQuick}
            style={{
              flex: 1, background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(6px)', border: 'none',
              borderRadius: 100, padding: 10, fontFamily: 'Montserrat,sans-serif', fontWeight: 600, fontSize: 12,
              color: '#6A4E2F', cursor: 'pointer',
            }}
          >
            Quick View
          </button>
        </div>
      </div>
      <div style={{ padding: '18px 18px 20px' }}>
        {p.organic && (
          <span style={{ display: 'inline-block', fontFamily: 'Montserrat,sans-serif', fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em', color: '#8BC34A', marginBottom: 6 }}>
            🌿 CERTIFIED ORGANIC
          </span>
        )}
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 600, color: '#2a1f12', lineHeight: 1.25, minHeight: 44 }}>
          {p.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <span style={{ color: '#D4AF37', fontSize: 13, letterSpacing: '1px' }}>{stars(p.rating)}</span>
          <span style={{ color: '#8a7a63', fontSize: 12 }}>({p.reviews})</span>
          <span style={{ color: '#c8bba2', fontSize: 12 }}>· {p.weight}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#6A4E2F' }}>{money(p.price)}</span>
            <span style={{ textDecoration: 'line-through', color: '#b0a288', fontSize: 13 }}>{money(p.oldPrice)}</span>
          </div>
          <button
            className="add-to-cart-btn"
            onClick={onAdd}
            disabled={soldOut}
            title={soldOut ? 'Out of stock' : 'Add to cart'}
            style={{
              width: 44, height: 44, borderRadius: '50%', background: soldOut ? '#c8bba2' : '#6A4E2F', color: '#fff', border: 'none',
              cursor: soldOut ? 'not-allowed' : 'pointer', fontSize: 20, display: 'grid', placeItems: 'center',
              transition: 'transform .2s, background .2s',
            }}
          >
            {soldOut ? '✕' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}
