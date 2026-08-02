import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { money } from '../utils/format';

const METHOD_LABEL = { card: 'Card', upi: 'UPI', cod: 'Cash on Delivery' };
const STATUS = {
  paid: { label: 'Paid', bg: '#EAF3DC', fg: '#4a6b2a' },
  'test-paid': { label: 'Paid (test)', bg: '#FFF6E3', fg: '#8a6d1f' },
  cod: { label: 'Pay on delivery', bg: '#F5EFE2', fg: '#6A4E2F' },
  pending: { label: 'Pending', bg: '#FBE9E7', fg: '#A33A2A' },
};

function statusChip(paymentStatus) {
  const s = STATUS[paymentStatus] || { label: paymentStatus, bg: '#F5EFE2', fg: '#6A4E2F' };
  return (
    <span style={{
      fontFamily: 'Montserrat,sans-serif', fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em',
      textTransform: 'uppercase', background: s.bg, color: s.fg, padding: '5px 10px', borderRadius: 100,
    }}>
      {s.label}
    </span>
  );
}

export default function Orders() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api.getMyOrders(token)
      .then((data) => { if (!cancelled) setOrders(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [token]);

  const shell = (children) => (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 32px 100px' }}>
      <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 12, letterSpacing: '.24em', color: '#B08D3E', fontWeight: 600 }}>YOUR ACCOUNT</span>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 700, color: '#2a1f12', margin: '14px 0 30px' }}>Order history</h1>
      {children}
    </section>
  );

  if (!token) {
    return shell(
      <div style={{ background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 20, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <p style={{ color: '#6c5c47', fontSize: 15, marginTop: 12 }}>Sign in to see the orders on your account.</p>
        <p style={{ color: '#8a7a63', fontSize: 13, marginTop: 6 }}>Placed an order as a guest? It won’t appear here — use the order number from your confirmation.</p>
        <button onClick={() => navigate('/shop')} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, background: '#6A4E2F', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: 100, cursor: 'pointer', marginTop: 20 }}>
          Continue Shopping
        </button>
      </div>
    );
  }

  if (error) {
    return shell(<div style={{ color: '#EA4335', fontSize: 14 }}>Couldn’t load your orders: {error}</div>);
  }

  if (orders === null) {
    return shell(<div style={{ color: '#8a7a63', fontSize: 14 }}>Loading your orders…</div>);
  }

  if (orders.length === 0) {
    return shell(
      <div style={{ background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 20, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>📦</div>
        <p style={{ color: '#6c5c47', fontSize: 15, marginTop: 12 }}>No orders yet, {user?.name?.split(' ')[0] || 'there'}.</p>
        <button onClick={() => navigate('/shop')} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, background: '#6A4E2F', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: 100, cursor: 'pointer', marginTop: 20 }}>
          Start Shopping
        </button>
      </div>
    );
  }

  return shell(
    <div style={{ display: 'grid', gap: 18 }}>
      {orders.map((o) => (
        <article key={o.orderNo} style={{ background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 20, overflow: 'hidden' }}>
          <header style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '18px 22px', borderBottom: '1px solid rgba(106,78,47,.08)' }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#2a1f12' }}>#FDF-{o.orderNo}</div>
              <div style={{ fontSize: 12, color: '#8a7a63', marginTop: 2 }}>
                {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}{METHOD_LABEL[o.paymentMethod] || o.paymentMethod}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              {statusChip(o.paymentStatus)}
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#6A4E2F' }}>{money(o.total)}</span>
            </div>
          </header>
          <div style={{ padding: '14px 22px 18px' }}>
            {o.items.map((it) => (
              <div key={it.slug} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', fontSize: 13.5, color: '#4a3a26' }}>
                <span>{it.qty} × {it.name}</span>
                <span style={{ color: '#6c5c47' }}>{money(it.unitPrice * it.qty)}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed rgba(106,78,47,.2)', display: 'grid', gap: 4, fontSize: 12.5, color: '#8a7a63' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{money(o.subtotal)}</span></div>
              {o.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34A853' }}>
                  <span>Discount{o.couponCode ? ` (${o.couponCode})` : ''}</span><span>−{money(o.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><span>{o.shipping === 0 ? 'FREE' : money(o.shipping)}</span></div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
