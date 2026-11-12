import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { money } from '../utils/format';

const input = { border: '1px solid rgba(106,78,47,.2)', borderRadius: 12, padding: '13px 16px', fontFamily: "'Poppins',sans-serif", fontSize: 13.5, outline: 'none', width: '100%' };
const label = { fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '.08em', color: '#8a7a63', textTransform: 'uppercase', marginBottom: 6, display: 'block' };

const STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: '📝' },
  { key: 'shipped', label: 'Shipped', icon: '📦' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
];

function Timeline({ status }) {
  if (status === 'cancelled') {
    return <div style={{ background: '#FBE9E7', color: '#A33A2A', borderRadius: 12, padding: '14px 16px', fontWeight: 600, fontSize: 14 }}>This order was cancelled.</div>;
  }
  const current = Math.max(0, STEPS.findIndex((s) => s.key === status));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', margin: '8px 0 4px' }}>
      {STEPS.map((s, i) => {
        const done = i <= current;
        return (
          <div key={s.key} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
            {i < STEPS.length - 1 && (
              <div style={{ position: 'absolute', top: 19, left: '50%', width: '100%', height: 3, background: i < current ? '#6A4E2F' : '#E7DECD', zIndex: 0 }} />
            )}
            <div style={{ position: 'relative', zIndex: 1, width: 40, height: 40, borderRadius: '50%', margin: '0 auto', display: 'grid', placeItems: 'center', fontSize: 18, background: done ? '#6A4E2F' : '#F0EADF', color: done ? '#fff' : '#b0a288', border: i === current ? '3px solid #D4AF37' : 'none' }}>{s.icon}</div>
            <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 11.5, fontWeight: 700, color: done ? '#6A4E2F' : '#b0a288', marginTop: 8 }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function Track() {
  const [params] = useSearchParams();
  const [orderNo, setOrderNo] = useState(params.get('order') || '');
  const [email, setEmail] = useState(params.get('email') || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function lookup(e) {
    if (e) e.preventDefault();
    setError(''); setOrder(null); setBusy(true);
    try {
      const o = await api.trackOrder({ orderNo: orderNo.trim(), email: email.trim() });
      setOrder(o);
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  }

  // Auto-lookup when deep-linked with both params.
  useEffect(() => {
    if (params.get('order') && params.get('email')) lookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section style={{ maxWidth: 640, margin: '0 auto', padding: '56px 28px 90px' }}>
      <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 12, letterSpacing: '.24em', color: '#B08D3E', fontWeight: 600 }}>ORDER TRACKING</span>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 700, color: '#2a1f12', margin: '12px 0 24px' }}>Track your order</h1>

      <form onSubmit={lookup} style={{ background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 18, padding: 24, display: 'grid', gap: 14 }}>
        <div>
          <label style={label} htmlFor="t-order">Order number</label>
          <input id="t-order" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="e.g. FDF-1234567890" style={input} required />
        </div>
        <div>
          <label style={label} htmlFor="t-email">Email on the order</label>
          <input id="t-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={input} required />
        </div>
        {error && <div role="alert" style={{ color: '#EA4335', fontSize: 12.5 }}>{error}</div>}
        <button type="submit" disabled={busy} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, background: '#6A4E2F', color: '#fff', border: 'none', padding: 15, borderRadius: 100, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Looking up…' : 'Track order'}
        </button>
      </form>

      {order && (
        <div style={{ background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 18, padding: 26, marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#2a1f12', margin: 0 }}>#FDF-{order.orderNo}</h2>
            <span style={{ fontSize: 12.5, color: '#8a7a63' }}>Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          <div style={{ margin: '24px 0 18px' }}><Timeline status={order.status} /></div>

          <div style={{ borderTop: '1px solid rgba(106,78,47,.1)', paddingTop: 16 }}>
            {order.items.map((it) => (
              <div key={it.slug} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#3a2c1a', padding: '4px 0' }}>
                <span>{it.qty} × {it.name}</span><span style={{ color: '#6c5c47' }}>{money(it.unitPrice * it.qty)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px dashed rgba(106,78,47,.2)', fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#6A4E2F', fontSize: 17 }}>
              <span>Total</span><span>{money(order.total)}</span>
            </div>
            <div style={{ fontSize: 12, color: '#8a7a63', marginTop: 8 }}>Payment: {(order.paymentMethod || '').toUpperCase()} · {order.paymentStatus === 'cod' ? 'Pay on delivery' : order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}</div>
          </div>
        </div>
      )}
    </section>
  );
}
