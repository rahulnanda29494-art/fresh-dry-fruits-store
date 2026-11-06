import { useEffect, useState, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { money } from '../utils/format';

const METHOD_LABEL = { card: 'Card', upi: 'UPI', cod: 'COD' };
const PAY_STATUS = {
  paid: { label: 'Paid', bg: '#EAF3DC', fg: '#4a6b2a' },
  'test-paid': { label: 'Paid (test)', bg: '#FFF6E3', fg: '#8a6d1f' },
  cod: { label: 'COD', bg: '#F5EFE2', fg: '#6A4E2F' },
  pending: { label: 'Pending', bg: '#FBE9E7', fg: '#A33A2A' },
};
const FULFIL = {
  confirmed: { label: 'Confirmed', bg: '#EEF3F8', fg: '#3a5a7a' },
  shipped: { label: 'Shipped', bg: '#E6F0FF', fg: '#2a5bb8' },
  delivered: { label: 'Delivered', bg: '#EAF3DC', fg: '#4a6b2a' },
  cancelled: { label: 'Cancelled', bg: '#FBE9E7', fg: '#A33A2A' },
};

const chipStyle = (s) => ({ fontFamily: 'Montserrat,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', background: s.bg, color: s.fg, padding: '4px 9px', borderRadius: 100, whiteSpace: 'nowrap' });
const payChip = (st) => <span style={chipStyle(PAY_STATUS[st] || { label: st, bg: '#F5EFE2', fg: '#6A4E2F' })}>{(PAY_STATUS[st] || { label: st }).label}</span>;
const fulfilChip = (st) => <span style={chipStyle(FULFIL[st] || FULFIL.confirmed)}>{(FULFIL[st] || FULFIL.confirmed).label}</span>;

const card = { background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 18 };
const cardHead = { fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#2a1f12', margin: 0 };
const labelCss = { fontFamily: 'Montserrat,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', color: '#8a7a63', textTransform: 'uppercase' };

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function printInvoice(o) {
  const rows = o.items.map((it) => `<tr><td>${escapeHtml(it.name)}</td><td style="text-align:center">${it.qty}</td><td style="text-align:right">${money(it.unitPrice)}</td><td style="text-align:right">${money(it.unitPrice * it.qty)}</td></tr>`).join('');
  const addr = o.fullAddress || {};
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice FDF-${o.orderNo}</title>
  <style>*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#2a1f12;margin:0;padding:40px;max-width:800px}
  .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #6A4E2F;padding-bottom:18px}
  .brand{font-size:22px;font-weight:700;color:#6A4E2F}.brand small{display:block;font-size:10px;letter-spacing:2px;color:#B08D3E;font-weight:400}
  .meta{text-align:right;font-size:12px;color:#555}.meta b{color:#2a1f12}
  h2{font-size:13px;letter-spacing:1px;color:#8a7a63;text-transform:uppercase;margin:26px 0 8px}
  .cols{display:flex;gap:40px}.cols>div{flex:1;font-size:13px;line-height:1.6}
  table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px}
  th{background:#F5EFE2;color:#6A4E2F;text-align:left;padding:9px 10px;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
  td{padding:9px 10px;border-bottom:1px solid #eee}
  .totals{margin-top:14px;margin-left:auto;width:280px;font-size:13px}.totals div{display:flex;justify-content:space-between;padding:4px 0}
  .totals .grand{border-top:2px solid #6A4E2F;margin-top:6px;padding-top:8px;font-size:16px;font-weight:700;color:#6A4E2F}
  .foot{margin-top:36px;text-align:center;color:#8a7a63;font-size:12px}@media print{body{padding:0}}</style></head><body>
    <div class="top"><div class="brand">Fresh Dry Fruits<small>NATURE'S FINEST · SINCE 1998</small></div>
    <div class="meta"><b>INVOICE</b><br>#FDF-${o.orderNo}<br>${new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}<br>Payment: ${METHOD_LABEL[o.paymentMethod] || o.paymentMethod} · ${escapeHtml(o.paymentStatus)}<br>Status: ${escapeHtml(o.status)}</div></div>
    <div class="cols"><div><h2>Billed to</h2>${escapeHtml(o.customerName)}<br>${escapeHtml(o.customerEmail)}<br>${escapeHtml(o.phone)}</div>
    <div><h2>Ship to</h2>${escapeHtml([addr.line1, addr.city, addr.pin].filter(Boolean).join(', ') || o.address)}</div></div>
    <h2>Items</h2><table><thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="totals"><div><span>Subtotal</span><span>${money(o.subtotal)}</span></div>
    ${o.discount > 0 ? `<div><span>Discount${o.couponCode ? ' (' + escapeHtml(o.couponCode) + ')' : ''}</span><span>-${money(o.discount)}</span></div>` : ''}
    <div><span>Shipping</span><span>${o.shipping === 0 ? 'FREE' : money(o.shipping)}</span></div>
    <div class="grand"><span>Total</span><span>${money(o.total)}</span></div></div>
    <div class="foot">Thank you for shopping with Fresh Dry Fruits 🌰</div>
    <script>window.onload=function(){window.print();}</script></body></html>`;
  const w = window.open('', '_blank', 'width=820,height=900');
  if (!w) { alert('Please allow pop-ups to print the invoice.'); return; }
  w.document.write(html); w.document.close();
}

function exportCsv(orders) {
  const head = ['Order', 'Date', 'Customer', 'Email', 'Phone', 'Address', 'Method', 'Payment', 'Fulfilment', 'Items', 'Subtotal', 'Discount', 'Shipping', 'Total'];
  const esc = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const lines = orders.map((o) => [
    'FDF-' + o.orderNo,
    new Date(o.createdAt).toLocaleDateString('en-CA'),
    o.customerName, o.customerEmail, o.phone, o.address,
    METHOD_LABEL[o.paymentMethod] || o.paymentMethod, o.paymentStatus, o.status,
    o.items.map((i) => `${i.qty}x ${i.name}`).join('; '),
    o.subtotal, o.discount, o.shipping, o.total,
  ].map(esc).join(','));
  const csv = [head.map(esc).join(','), ...lines].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url; a.download = `fresh-dry-fruits-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

function Tile({ label, value, sub }) {
  return (
    <div style={{ ...card, padding: '16px 18px' }}>
      <div style={labelCss}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#2a1f12', marginTop: 5 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: '#8a7a63', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// Horizontal bar list (top products / customers / payment split).
function BarList({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'grid', gridTemplateColumns: '130px 1fr auto', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12.5, color: '#3a2c1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.label}>{r.label}</span>
          <div style={{ background: '#F0EADF', borderRadius: 100, height: 10, overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(4, (r.value / max) * 100)}%`, height: '100%', background: 'linear-gradient(90deg,#B08D3E,#6A4E2F)', borderRadius: 100 }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#6A4E2F', whiteSpace: 'nowrap' }}>{r.display}</span>
        </div>
      ))}
    </div>
  );
}

// Vertical month bars.
function MonthBars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.revenue));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 160, paddingTop: 8 }}>
      {rows.map((r) => (
        <div key={r.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6A4E2F' }}>{money(r.revenue)}</span>
          <div title={`${r.count} orders`} style={{ width: '100%', maxWidth: 46, height: `${Math.max(4, (r.revenue / max) * 110)}px`, background: 'linear-gradient(180deg,#B08D3E,#6A4E2F)', borderRadius: '8px 8px 0 0' }} />
          <span style={{ fontSize: 11, color: '#8a7a63', whiteSpace: 'nowrap' }}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

function SalesTable({ title, rows, fmt }) {
  const totalRev = rows.reduce((t, [, v]) => t + v.revenue, 0);
  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(106,78,47,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={cardHead}>{title}</h3>
        <span style={{ fontSize: 12.5, color: '#8a7a63' }}>{rows.length} period{rows.length === 1 ? '' : 's'} · {money(totalRev)}</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Poppins',sans-serif", fontSize: 13, minWidth: 420 }}>
          <thead><tr style={{ background: '#F5EFE2', color: '#6A4E2F', fontFamily: 'Montserrat,sans-serif', fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>
            <th style={{ textAlign: 'left', padding: '11px 16px' }}>Period</th><th style={{ textAlign: 'right', padding: '11px 16px' }}>Orders</th><th style={{ textAlign: 'right', padding: '11px 16px' }}>Items</th><th style={{ textAlign: 'right', padding: '11px 16px' }}>Revenue</th>
          </tr></thead>
          <tbody>{rows.map(([k, v]) => (
            <tr key={k} style={{ borderTop: '1px solid rgba(106,78,47,.08)' }}>
              <td style={{ padding: '11px 16px', color: '#2a1f12', fontWeight: 600 }}>{fmt(k)}</td>
              <td style={{ padding: '11px 16px', textAlign: 'right', color: '#6c5c47' }}>{v.count}</td>
              <td style={{ padding: '11px 16px', textAlign: 'right', color: '#6c5c47' }}>{v.items}</td>
              <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 700, color: '#6A4E2F' }}>{money(v.revenue)}</td>
            </tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}

export default function Seller() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [openRow, setOpenRow] = useState(null);
  const [view, setView] = useState('overview');
  const [busy, setBusy] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token || !user?.isAdmin) return;
    let cancelled = false;
    api.getAdminOrders(token).then((d) => { if (!cancelled) setData(d); }).catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [token, user]);

  const analytics = useMemo(() => {
    if (!data) return null;
    const orders = data.orders;
    const byDay = {}, byMonth = {}, prod = {}, cust = {};
    const todayStr = new Date().toLocaleDateString('en-CA');
    const monthStr = todayStr.slice(0, 7);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 6);
    let today = 0, week = 0, month = 0, pending = 0;

    for (const o of orders) {
      const dt = new Date(o.createdAt);
      const day = dt.toLocaleDateString('en-CA');
      const mon = day.slice(0, 7);
      const items = o.items.reduce((s, i) => s + i.qty, 0);
      (byDay[day] = byDay[day] || { count: 0, revenue: 0, items: 0 });
      byDay[day].count++; byDay[day].revenue += o.total; byDay[day].items += items;
      (byMonth[mon] = byMonth[mon] || { count: 0, revenue: 0, items: 0 });
      byMonth[mon].count++; byMonth[mon].revenue += o.total; byMonth[mon].items += items;
      if (day === todayStr) today += o.total;
      if (dt >= weekAgo) week += o.total;
      if (mon === monthStr) month += o.total;
      if (o.status === 'confirmed') pending++;
      for (const it of o.items) {
        (prod[it.name] = prod[it.name] || { qty: 0, revenue: 0 });
        prod[it.name].qty += it.qty; prod[it.name].revenue += it.unitPrice * it.qty;
      }
      const key = o.customerEmail || o.customerName;
      (cust[key] = cust[key] || { name: o.customerName, orders: 0, spend: 0 });
      cust[key].orders++; cust[key].spend += o.total;
    }
    const sortDesc = (obj) => Object.entries(obj).sort((a, b) => b[0].localeCompare(a[0]));
    const monthsAsc = sortDesc(byMonth).slice(0, 6).reverse().map(([k, v]) => ({ key: k, label: new Date(k + '-01').toLocaleDateString('en-IN', { month: 'short' }), revenue: v.revenue, count: v.count }));
    const topProducts = Object.entries(prod).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 6)
      .map(([name, v]) => ({ label: name, value: v.revenue, display: `${money(v.revenue)} · ${v.qty}` }));
    const topCustomers = Object.values(cust).sort((a, b) => b.spend - a.spend).slice(0, 6)
      .map((c) => ({ label: c.name, value: c.spend, display: `${money(c.spend)} · ${c.orders}` }));
    return { byDay: sortDesc(byDay), byMonth: sortDesc(byMonth), monthsAsc, topProducts, topCustomers, today, week, month, pending };
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.orders.filter((o) =>
      (statusFilter === 'all' || o.status === statusFilter) &&
      (methodFilter === 'all' || o.paymentMethod === methodFilter) &&
      (!q || o.orderNo.includes(q) || (o.customerName || '').toLowerCase().includes(q) || (o.customerEmail || '').toLowerCase().includes(q))
    );
  }, [data, statusFilter, methodFilter, search]);

  async function setStatus(orderNo, status) {
    setBusy(orderNo);
    try {
      await api.updateOrderStatus(orderNo, status, token);
      setData((d) => ({ ...d, orders: d.orders.map((o) => (o.orderNo === orderNo ? { ...o, status } : o)) }));
      showToast(`Order #${orderNo} marked ${status}`);
    } catch (e) { showToast(e.message); } finally { setBusy(null); }
  }

  const shell = (children) => (
    <section style={{ maxWidth: 1120, margin: '0 auto', padding: '56px 28px 100px' }}>
      <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 12, letterSpacing: '.24em', color: '#B08D3E', fontWeight: 600 }}>SELLER DASHBOARD</span>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 700, color: '#2a1f12', margin: '12px 0 24px' }}>Orders &amp; analytics</h1>
      {children}
    </section>
  );

  if (!user || !user.isAdmin) {
    return shell(
      <div style={{ ...card, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <p style={{ color: '#6c5c47', fontSize: 15, marginTop: 12 }}>This area is for the store seller only.</p>
        <button onClick={() => navigate('/')} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, background: '#6A4E2F', color: '#fff', border: 'none', padding: '13px 28px', borderRadius: 100, cursor: 'pointer', marginTop: 18 }}>Back to store</button>
      </div>
    );
  }
  if (error) return shell(<div style={{ color: '#EA4335', fontSize: 14 }}>Couldn’t load orders: {error}</div>);
  if (!data) return shell(<div style={{ color: '#8a7a63', fontSize: 14 }}>Loading dashboard…</div>);

  const { summary } = data;
  const tabBtn = (id, label) => (
    <button onClick={() => setView(id)} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 13, padding: '9px 20px', borderRadius: 100, cursor: 'pointer', border: '1.5px solid ' + (view === id ? '#6A4E2F' : 'rgba(106,78,47,.2)'), background: view === id ? '#6A4E2F' : '#fff', color: view === id ? '#fff' : '#6A4E2F' }}>{label}</button>
  );
  const actionBtn = (label, onClick, primary) => (
    <button onClick={onClick} disabled={busy} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 11.5, padding: '8px 14px', borderRadius: 100, cursor: busy ? 'default' : 'pointer', border: '1.5px solid ' + (primary ? '#2a5bb8' : 'rgba(106,78,47,.25)'), background: primary ? '#2a5bb8' : '#fff', color: primary ? '#fff' : '#6A4E2F', opacity: busy ? 0.6 : 1 }}>{label}</button>
  );
  const selectCss = { fontFamily: "'Poppins',sans-serif", fontSize: 13, padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(106,78,47,.2)', background: '#fff', color: '#3a2c1a', outline: 'none' };

  return shell(
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabBtn('overview', 'Overview')}
        {tabBtn('orders', 'Orders')}
        {tabBtn('sales', 'Sales report')}
      </div>

      {view === 'overview' && analytics && (
        <div style={{ display: 'grid', gap: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
            <Tile label="Total revenue" value={money(summary.totalRevenue)} sub={`${summary.totalOrders} orders`} />
            <Tile label="Avg order value" value={money(summary.avgOrderValue)} />
            <Tile label="This month" value={money(analytics.month)} />
            <Tile label="Today" value={money(analytics.today)} sub={`7-day ${money(analytics.week)}`} />
            <Tile label="Items sold" value={summary.totalItems} />
            <Tile label="To ship" value={analytics.pending} sub="confirmed, unshipped" />
          </div>

          <div style={{ ...card, padding: '18px 22px' }}>
            <h3 style={{ ...cardHead, marginBottom: 12 }}>Revenue by month</h3>
            {analytics.monthsAsc.length ? <MonthBars rows={analytics.monthsAsc} /> : <div style={{ color: '#8a7a63', fontSize: 13 }}>No data yet.</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
            <div style={{ ...card, padding: '18px 22px' }}>
              <h3 style={{ ...cardHead, marginBottom: 6 }}>Top products</h3>
              <div style={{ ...labelCss, marginBottom: 12 }}>Revenue · units</div>
              {analytics.topProducts.length ? <BarList rows={analytics.topProducts} /> : <div style={{ color: '#8a7a63', fontSize: 13 }}>No sales yet.</div>}
            </div>
            <div style={{ ...card, padding: '18px 22px' }}>
              <h3 style={{ ...cardHead, marginBottom: 6 }}>Top customers</h3>
              <div style={{ ...labelCss, marginBottom: 12 }}>Spend · orders</div>
              {analytics.topCustomers.length ? <BarList rows={analytics.topCustomers} /> : <div style={{ color: '#8a7a63', fontSize: 13 }}>No customers yet.</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
            <div style={{ ...card, padding: '18px 22px' }}>
              <h3 style={{ ...cardHead, marginBottom: 12 }}>Fulfilment status</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <div key={s} style={{ flex: '1 1 110px', background: (FULFIL[s].bg), borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: FULFIL[s].fg }}>{summary.byStatus?.[s] || 0}</div>
                    <div style={{ fontSize: 11.5, color: FULFIL[s].fg, fontWeight: 600 }}>{FULFIL[s].label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...card, padding: '18px 22px' }}>
              <h3 style={{ ...cardHead, marginBottom: 12 }}>Revenue by payment method</h3>
              <BarList rows={Object.entries(summary.byMethodRevenue || {}).sort((a, b) => b[1] - a[1]).map(([m, rev]) => ({ label: METHOD_LABEL[m] || m, value: rev, display: `${money(rev)} · ${summary.byMethod[m]}` }))} />
            </div>
          </div>
        </div>
      )}

      {view === 'orders' && (
        <>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order #, name, email…" style={{ ...selectCss, flex: '1 1 220px', minWidth: 180 }} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectCss}>
              <option value="all">All statuses</option>
              {Object.keys(FULFIL).map((s) => <option key={s} value={s}>{FULFIL[s].label}</option>)}
            </select>
            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} style={selectCss}>
              <option value="all">All methods</option>
              <option value="upi">UPI</option><option value="card">Card</option><option value="cod">COD</option>
            </select>
            <button onClick={() => exportCsv(filtered)} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 12.5, padding: '9px 16px', borderRadius: 100, cursor: 'pointer', border: '1.5px solid #6A4E2F', background: '#fff', color: '#6A4E2F' }}>⬇ Export CSV</button>
          </div>
          <div style={{ fontSize: 12.5, color: '#8a7a63', marginBottom: 10 }}>{filtered.length} of {data.orders.length} orders</div>

          {filtered.length === 0 ? (
            <div style={{ ...card, padding: 40, textAlign: 'center', color: '#8a7a63' }}>No orders match.</div>
          ) : (
            <div style={{ ...card, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Poppins',sans-serif", fontSize: 13, minWidth: 780 }}>
                  <thead><tr style={{ background: '#F5EFE2', color: '#6A4E2F', fontFamily: 'Montserrat,sans-serif', fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                    <th style={{ textAlign: 'left', padding: '13px 16px' }}>Order</th><th style={{ textAlign: 'left', padding: '13px 16px' }}>Date</th><th style={{ textAlign: 'left', padding: '13px 16px' }}>Customer</th><th style={{ textAlign: 'left', padding: '13px 16px' }}>Fulfilment</th><th style={{ textAlign: 'left', padding: '13px 16px' }}>Payment</th><th style={{ textAlign: 'right', padding: '13px 16px' }}>Total</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map((o) => (
                      <Fragment key={o.orderNo}>
                        <tr onClick={() => setOpenRow(openRow === o.orderNo ? null : o.orderNo)} style={{ borderTop: '1px solid rgba(106,78,47,.08)', cursor: 'pointer' }}>
                          <td style={{ padding: '13px 16px', fontWeight: 600, color: '#2a1f12', whiteSpace: 'nowrap' }}>#FDF-{o.orderNo}</td>
                          <td style={{ padding: '13px 16px', color: '#6c5c47', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                          <td style={{ padding: '13px 16px', color: '#3a2c1a' }}>{o.customerName}{o.isGuest && <span style={{ fontSize: 10, color: '#a08a63', marginLeft: 6 }}>(guest)</span>}<div style={{ fontSize: 11, color: '#8a7a63' }}>{o.customerEmail}</div></td>
                          <td style={{ padding: '13px 16px' }}>{fulfilChip(o.status)}</td>
                          <td style={{ padding: '13px 16px' }}>{payChip(o.paymentStatus)} <span style={{ fontSize: 11, color: '#8a7a63' }}>{METHOD_LABEL[o.paymentMethod] || o.paymentMethod}</span></td>
                          <td style={{ padding: '13px 16px', textAlign: 'right', fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#6A4E2F', whiteSpace: 'nowrap' }}>{money(o.total)}</td>
                        </tr>
                        {openRow === o.orderNo && (
                          <tr style={{ background: '#FBF7EE' }}>
                            <td colSpan={6} style={{ padding: '4px 16px 18px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18, paddingTop: 12 }}>
                                <div>
                                  <div style={{ ...labelCss, marginBottom: 6 }}>Items</div>
                                  {o.items.map((it, idx) => (<div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#3a2c1a', padding: '2px 0' }}><span>{it.qty} × {it.name}</span><span style={{ color: '#6c5c47' }}>{money(it.unitPrice * it.qty)}</span></div>))}
                                  {o.couponCode && <div style={{ fontSize: 11.5, color: '#34A853', marginTop: 4 }}>Coupon {o.couponCode} · −{money(o.discount)}</div>}
                                  <div style={{ fontSize: 11.5, color: '#8a7a63', marginTop: 4 }}>Shipping {o.shipping === 0 ? 'FREE' : money(o.shipping)}</div>
                                </div>
                                <div><div style={{ ...labelCss, marginBottom: 6 }}>Ship to</div><div style={{ fontSize: 12.5, color: '#3a2c1a', lineHeight: 1.6 }}>{o.customerName}<br />{o.phone}<br />{o.address}</div></div>
                              </div>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, alignItems: 'center' }}>
                                {actionBtn('🖨️ Print invoice', () => printInvoice(o))}
                                {o.status !== 'shipped' && o.status !== 'delivered' && actionBtn('📦 Mark shipped', () => setStatus(o.orderNo, 'shipped'), true)}
                                {o.status === 'shipped' && actionBtn('✅ Mark delivered', () => setStatus(o.orderNo, 'delivered'), true)}
                                {o.status !== 'confirmed' && o.status !== 'cancelled' && actionBtn('↩ Reset to confirmed', () => setStatus(o.orderNo, 'confirmed'))}
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
      )}

      {view === 'sales' && analytics && (
        <div style={{ display: 'grid', gap: 26 }}>
          <SalesTable title="Month-wise sales" rows={analytics.byMonth} fmt={(k) => new Date(k + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} />
          <SalesTable title="Day-wise sales" rows={analytics.byDay} fmt={(k) => new Date(k).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
        </div>
      )}
    </>
  );
}
