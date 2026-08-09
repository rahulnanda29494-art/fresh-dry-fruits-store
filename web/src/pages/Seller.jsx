import { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { money } from '../utils/format';

const METHOD_LABEL = { card: 'Card', upi: 'UPI', cod: 'COD' };
const STATUS = {
  paid: { label: 'Paid', bg: '#EAF3DC', fg: '#4a6b2a' },
  'test-paid': { label: 'Paid (test)', bg: '#FFF6E3', fg: '#8a6d1f' },
  cod: { label: 'COD', bg: '#F5EFE2', fg: '#6A4E2F' },
  pending: { label: 'Pending', bg: '#FBE9E7', fg: '#A33A2A' },
};

function chip(status) {
  const s = STATUS[status] || { label: status, bg: '#F5EFE2', fg: '#6A4E2F' };
  return <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', background: s.bg, color: s.fg, padding: '4px 9px', borderRadius: 100, whiteSpace: 'nowrap' }}>{s.label}</span>;
}

function Tile({ label, value }) {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 16, padding: '18px 20px' }}>
      <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', color: '#8a7a63', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#2a1f12', marginTop: 6 }}>{value}</div>
    </div>
  );
}

export default function Seller() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [openRow, setOpenRow] = useState(null);

  useEffect(() => {
    if (!token || !user?.isAdmin) return;
    let cancelled = false;
    api.getAdminOrders(token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [token, user]);

  const shell = (children) => (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 28px 100px' }}>
      <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 12, letterSpacing: '.24em', color: '#B08D3E', fontWeight: 600 }}>SELLER DASHBOARD</span>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 700, color: '#2a1f12', margin: '12px 0 24px' }}>Orders</h1>
      {children}
    </section>
  );

  if (!user || !user.isAdmin) {
    return shell(
      <div style={{ background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 20, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <p style={{ color: '#6c5c47', fontSize: 15, marginTop: 12 }}>This area is for the store seller only.</p>
        <button onClick={() => navigate('/')} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, background: '#6A4E2F', color: '#fff', border: 'none', padding: '13px 28px', borderRadius: 100, cursor: 'pointer', marginTop: 18 }}>Back to store</button>
      </div>
    );
  }

  if (error) return shell(<div style={{ color: '#EA4335', fontSize: 14 }}>Couldn’t load orders: {error}</div>);
  if (!data) return shell(<div style={{ color: '#8a7a63', fontSize: 14 }}>Loading orders…</div>);

  const { summary, orders } = data;
  const methodBits = Object.entries(summary.byMethod).map(([m, n]) => `${METHOD_LABEL[m] || m}: ${n}`).join(' · ') || '—';

  return shell(
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
        <Tile label="Total orders" value={summary.totalOrders} />
        <Tile label="Revenue" value={money(summary.totalRevenue)} />
        <Tile label="Items sold" value={summary.totalItems} />
        <Tile label="By method" value={<span style={{ fontSize: 15, fontFamily: "'Poppins',sans-serif" }}>{methodBits}</span>} />
      </div>

      {orders.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 20, padding: 40, textAlign: 'center', color: '#8a7a63' }}>No orders yet.</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Poppins',sans-serif", fontSize: 13, minWidth: 720 }}>
              <thead>
                <tr style={{ background: '#F5EFE2', color: '#6A4E2F', fontFamily: 'Montserrat,sans-serif', fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                  <th style={{ textAlign: 'left', padding: '13px 16px' }}>Order</th>
                  <th style={{ textAlign: 'left', padding: '13px 16px' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '13px 16px' }}>Customer</th>
                  <th style={{ textAlign: 'left', padding: '13px 16px' }}>Payment</th>
                  <th style={{ textAlign: 'right', padding: '13px 16px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <Fragment key={o.orderNo}>
                    <tr onClick={() => setOpenRow(openRow === o.orderNo ? null : o.orderNo)} style={{ borderTop: '1px solid rgba(106,78,47,.08)', cursor: 'pointer' }}>
                      <td style={{ padding: '13px 16px', fontWeight: 600, color: '#2a1f12', whiteSpace: 'nowrap' }}>#FDF-{o.orderNo}</td>
                      <td style={{ padding: '13px 16px', color: '#6c5c47', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                      <td style={{ padding: '13px 16px', color: '#3a2c1a' }}>
                        {o.customerName}{o.isGuest && <span style={{ fontSize: 10, color: '#a08a63', marginLeft: 6 }}>(guest)</span>}
                        <div style={{ fontSize: 11, color: '#8a7a63' }}>{o.customerEmail}</div>
                      </td>
                      <td style={{ padding: '13px 16px' }}>{chip(o.paymentStatus)} <span style={{ fontSize: 11, color: '#8a7a63' }}>{METHOD_LABEL[o.paymentMethod] || o.paymentMethod}</span></td>
                      <td style={{ padding: '13px 16px', textAlign: 'right', fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#6A4E2F', whiteSpace: 'nowrap' }}>{money(o.total)}</td>
                    </tr>
                    {openRow === o.orderNo && (
                      <tr style={{ background: '#FBF7EE' }}>
                        <td colSpan={5} style={{ padding: '4px 16px 18px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18, paddingTop: 12 }}>
                            <div>
                              <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', color: '#8a7a63', textTransform: 'uppercase', marginBottom: 6 }}>Items</div>
                              {o.items.map((it, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#3a2c1a', padding: '2px 0' }}>
                                  <span>{it.qty} × {it.name}</span><span style={{ color: '#6c5c47' }}>{money(it.unitPrice * it.qty)}</span>
                                </div>
                              ))}
                              {o.couponCode && <div style={{ fontSize: 11.5, color: '#34A853', marginTop: 4 }}>Coupon {o.couponCode} · −{money(o.discount)}</div>}
                              <div style={{ fontSize: 11.5, color: '#8a7a63', marginTop: 4 }}>Shipping {o.shipping === 0 ? 'FREE' : money(o.shipping)}</div>
                            </div>
                            <div>
                              <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', color: '#8a7a63', textTransform: 'uppercase', marginBottom: 6 }}>Ship to</div>
                              <div style={{ fontSize: 12.5, color: '#3a2c1a', lineHeight: 1.6 }}>
                                {o.customerName}<br />{o.phone}<br />{o.address}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
