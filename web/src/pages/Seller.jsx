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

// Store identity shown on invoices. Fill `gstin` to switch the header to a GST
// "TAX INVOICE"; edit the address/contact to your real registered details.
const STORE = {
  name: 'Fresh Dry Fruits',
  tagline: "NATURE'S FINEST · SINCE 1998",
  addr1: 'Fresh Dry Fruits Pvt. Ltd.',
  addr2: 'Trimbak Road, Nashik, Maharashtra 422002, India',
  phone: '+91 93152 23605',
  email: 'care@freshdryfruits.in',
  gstin: '',
};

function amountInWords(num) {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = (x) => (x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : ''));
  const three = (x) => { const h = Math.floor(x / 100), r = x % 100; return (h ? a[h] + ' Hundred' + (r ? ' ' : '') : '') + (r ? two(r) : ''); };
  let n = Math.round(num);
  if (n === 0) return 'Zero';
  let out = '';
  const cr = Math.floor(n / 10000000); n %= 10000000;
  const la = Math.floor(n / 100000); n %= 100000;
  const th = Math.floor(n / 1000); n %= 1000;
  if (cr) out += three(cr) + ' Crore ';
  if (la) out += three(la) + ' Lakh ';
  if (th) out += three(th) + ' Thousand ';
  if (n) out += three(n);
  return out.trim();
}

function printInvoice(o) {
  const addr = o.fullAddress || {};
  const rows = o.items.map((it, i) => `<tr>
    <td style="text-align:center">${i + 1}</td>
    <td>${escapeHtml(it.name)}${it.weight ? `<span class="muted"> · ${escapeHtml(it.weight)}</span>` : ''}</td>
    <td style="text-align:center">${it.qty}</td>
    <td style="text-align:right">${money(it.unitPrice)}</td>
    <td style="text-align:right">${money(it.unitPrice * it.qty)}</td></tr>`).join('');
  const invDate = new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const title = STORE.gstin ? 'TAX INVOICE' : 'INVOICE';
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice FDF-${o.orderNo}</title>
  <style>@page{size:A4;margin:14mm}*{box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;color:#2a1f12;margin:0;padding:28px;max-width:820px;font-size:12.5px;line-height:1.5}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #6A4E2F;padding-bottom:14px}
  .brand .nm{font-size:22px;font-weight:800;color:#6A4E2F;letter-spacing:.3px}
  .brand .tag{font-size:9px;letter-spacing:2px;color:#B08D3E;margin:2px 0 8px}
  .brand .ln{font-size:11px;color:#555;line-height:1.6}
  .doc{text-align:right}.doc .ttl{font-size:20px;font-weight:800;color:#2a1f12;letter-spacing:1px}
  .doc table{margin-top:8px;font-size:11.5px;border-collapse:collapse;margin-left:auto}
  .doc td{padding:2px 0 2px 14px;text-align:right;color:#555}.doc td b{color:#2a1f12}
  .parties{display:flex;gap:28px;margin-top:18px}
  .parties>div{flex:1;background:#FBF7EE;border:1px solid #efe6d4;border-radius:8px;padding:12px 14px}
  .parties h3{margin:0 0 6px;font-size:10px;letter-spacing:1px;color:#8a7a63;text-transform:uppercase}
  .parties .nm{font-weight:700}
  table.items{width:100%;border-collapse:collapse;margin-top:18px}
  table.items th{background:#6A4E2F;color:#fff;text-align:left;padding:9px 10px;font-size:10.5px;text-transform:uppercase;letter-spacing:.4px}
  table.items td{padding:9px 10px;border-bottom:1px solid #eee}
  .muted{color:#999;font-size:11px}
  .bottom{display:flex;justify-content:space-between;gap:28px;margin-top:16px}
  .words{flex:1;font-size:11.5px;color:#4a3a26}
  .words b{display:block;font-size:10px;letter-spacing:1px;color:#8a7a63;text-transform:uppercase;margin-bottom:3px}
  .totals{width:270px;font-size:12.5px}.totals div{display:flex;justify-content:space-between;padding:4px 0}
  .totals .grand{border-top:2px solid #6A4E2F;margin-top:6px;padding-top:8px;font-size:16px;font-weight:800;color:#6A4E2F}
  .pay{margin-top:16px;background:#F5EFE2;border-radius:8px;padding:10px 14px;font-size:11.5px;color:#4a3a26}
  .terms{margin-top:14px;font-size:10.5px;color:#8a7a63;line-height:1.6}
  .sign{display:flex;justify-content:space-between;align-items:flex-end;margin-top:24px}
  .sign .box{text-align:center;font-size:11px;color:#555}
  .sign .line{border-top:1px solid #999;width:170px;margin-bottom:4px;padding-top:38px}
  .foot{margin-top:18px;text-align:center;color:#a08a63;font-size:10px;border-top:1px dashed #ddd;padding-top:10px}
  @media print{body{padding:0}}</style></head><body>
  <div class="hdr">
    <div class="brand"><div class="nm">${STORE.name}</div><div class="tag">${STORE.tagline}</div>
      <div class="ln">${escapeHtml(STORE.addr1)}<br>${escapeHtml(STORE.addr2)}<br>Tel: ${escapeHtml(STORE.phone)} · ${escapeHtml(STORE.email)}${STORE.gstin ? `<br>GSTIN: ${escapeHtml(STORE.gstin)}` : ''}</div></div>
    <div class="doc"><div class="ttl">${title}</div>
      <table>
        <tr><td>Invoice No</td><td><b>FDF-${o.orderNo}</b></td></tr>
        <tr><td>Invoice Date</td><td><b>${invDate}</b></td></tr>
        <tr><td>Order Ref</td><td>#${o.orderNo}</td></tr>
        <tr><td>Fulfilment</td><td>${escapeHtml((o.status || '').toUpperCase())}</td></tr>
      </table></div>
  </div>
  <div class="parties">
    <div><h3>Billed to</h3><div class="nm">${escapeHtml(o.customerName)}</div>${escapeHtml(o.customerEmail)}<br>${escapeHtml(o.phone)}</div>
    <div><h3>Shipped to</h3><div class="nm">${escapeHtml(addr.fullName || o.customerName)}</div>${escapeHtml(addr.line1 || '')}<br>${escapeHtml([addr.city, addr.pin].filter(Boolean).join(' - ') || o.address)}<br>${escapeHtml(addr.phone || o.phone)}</div>
  </div>
  <table class="items"><thead><tr><th style="width:36px;text-align:center">#</th><th>Description</th><th style="text-align:center;width:50px">Qty</th><th style="text-align:right;width:90px">Rate</th><th style="text-align:right;width:100px">Amount</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="bottom">
    <div class="words"><b>Amount in words</b>Rupees ${amountInWords(o.total)} Only</div>
    <div class="totals">
      <div><span>Subtotal</span><span>${money(o.subtotal)}</span></div>
      ${o.discount > 0 ? `<div><span>Discount${o.couponCode ? ' (' + escapeHtml(o.couponCode) + ')' : ''}</span><span>- ${money(o.discount)}</span></div>` : ''}
      <div><span>Shipping</span><span>${o.shipping === 0 ? 'FREE' : money(o.shipping)}</span></div>
      <div class="grand"><span>Grand Total</span><span>${money(o.total)}</span></div>
    </div>
  </div>
  <div class="pay"><b>Payment</b> — ${METHOD_LABEL[o.paymentMethod] || o.paymentMethod} · ${escapeHtml((o.paymentStatus || '').toUpperCase())}${o.paymentRef ? ` · Ref: ${escapeHtml(o.paymentRef)}` : ''}</div>
  <div class="terms">Prices are inclusive of all applicable taxes. Returns accepted within 7 days of delivery on unopened items per our return policy. For queries contact ${escapeHtml(STORE.email)} or ${escapeHtml(STORE.phone)}.</div>
  <div class="sign"><div class="box"><div class="line"></div>Customer Signature</div><div class="box"><div class="line"></div>For ${escapeHtml(STORE.name)}<br>Authorised Signatory</div></div>
  <div class="foot">This is a computer-generated invoice and does not require a physical signature. · Thank you for shopping with ${escapeHtml(STORE.name)} 🌰</div>
  <script>window.onload=function(){window.print();}</script></body></html>`;
  const w = window.open('', '_blank', 'width=880,height=1000');
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
  const [salesFrom, setSalesFrom] = useState('');
  const [salesTo, setSalesTo] = useState('');

  useEffect(() => {
    if (!token || !user?.isAdmin) return;
    let cancelled = false;
    api.getAdminOrders(token).then((d) => { if (!cancelled) setData(d); }).catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [token, user]);

  // Range-aware analytics — drives both the Overview and the Sales report, so
  // the From/To date range applies everywhere.
  const analytics = useMemo(() => {
    if (!data) return null;
    const orders = data.orders.filter((o) => {
      const day = new Date(o.createdAt).toLocaleDateString('en-CA');
      if (salesFrom && day < salesFrom) return false;
      if (salesTo && day > salesTo) return false;
      return true;
    });
    const byDay = {}, byMonth = {}, prod = {}, cust = {}, byStatus = {}, byMethod = {}, byMethodRevenue = {};
    let revenue = 0, items = 0, pending = 0;
    for (const o of orders) {
      const day = new Date(o.createdAt).toLocaleDateString('en-CA');
      const mon = day.slice(0, 7);
      const it = o.items.reduce((s, i) => s + i.qty, 0);
      (byDay[day] = byDay[day] || { count: 0, revenue: 0, items: 0 });
      byDay[day].count++; byDay[day].revenue += o.total; byDay[day].items += it;
      (byMonth[mon] = byMonth[mon] || { count: 0, revenue: 0, items: 0 });
      byMonth[mon].count++; byMonth[mon].revenue += o.total; byMonth[mon].items += it;
      revenue += o.total; items += it;
      if (o.status === 'confirmed') pending++;
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
      byMethod[o.paymentMethod] = (byMethod[o.paymentMethod] || 0) + 1;
      byMethodRevenue[o.paymentMethod] = (byMethodRevenue[o.paymentMethod] || 0) + o.total;
      for (const x of o.items) {
        (prod[x.name] = prod[x.name] || { qty: 0, revenue: 0 });
        prod[x.name].qty += x.qty; prod[x.name].revenue += x.unitPrice * x.qty;
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
    const count = orders.length;
    return { count, revenue, avgOrderValue: count ? Math.round(revenue / count) : 0, items, pending, byStatus, byMethod, byMethodRevenue, byDay: sortDesc(byDay), byMonth: sortDesc(byMonth), monthsAsc, topProducts, topCustomers };
  }, [data, salesFrom, salesTo]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.orders.filter((o) =>
      (statusFilter === 'all' || o.status === statusFilter) &&
      (methodFilter === 'all' || o.paymentMethod === methodFilter) &&
      (!q || o.orderNo.includes(q) || (o.customerName || '').toLowerCase().includes(q) || (o.customerEmail || '').toLowerCase().includes(q))
    );
  }, [data, statusFilter, methodFilter, search]);

  function salesPreset(kind) {
    const now = new Date();
    const today = now.toLocaleDateString('en-CA');
    if (kind === 'month') { setSalesFrom(today.slice(0, 7) + '-01'); setSalesTo(today); }
    else if (kind === '30') { const d = new Date(now); d.setDate(d.getDate() - 29); setSalesFrom(d.toLocaleDateString('en-CA')); setSalesTo(today); }
    else if (kind === 'year') { setSalesFrom(today.slice(0, 4) + '-01-01'); setSalesTo(today); }
    else { setSalesFrom(''); setSalesTo(''); }
  }

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

  const tabBtn = (id, label) => (
    <button onClick={() => setView(id)} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 13, padding: '9px 20px', borderRadius: 100, cursor: 'pointer', border: '1.5px solid ' + (view === id ? '#6A4E2F' : 'rgba(106,78,47,.2)'), background: view === id ? '#6A4E2F' : '#fff', color: view === id ? '#fff' : '#6A4E2F' }}>{label}</button>
  );
  const actionBtn = (label, onClick, primary) => (
    <button onClick={onClick} disabled={busy} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 11.5, padding: '8px 14px', borderRadius: 100, cursor: busy ? 'default' : 'pointer', border: '1.5px solid ' + (primary ? '#2a5bb8' : 'rgba(106,78,47,.25)'), background: primary ? '#2a5bb8' : '#fff', color: primary ? '#fff' : '#6A4E2F', opacity: busy ? 0.6 : 1 }}>{label}</button>
  );
  const selectCss = { fontFamily: "'Poppins',sans-serif", fontSize: 13, padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(106,78,47,.2)', background: '#fff', color: '#3a2c1a', outline: 'none' };

  // Shared date-range control — the same range drives the Overview and the Sales report.
  const rangeBar = (
    <div style={{ ...card, padding: '14px 16px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={labelCss}>From</span>
      <input type="date" value={salesFrom} max={salesTo || undefined} onChange={(e) => setSalesFrom(e.target.value)} style={selectCss} />
      <span style={labelCss}>To</span>
      <input type="date" value={salesTo} min={salesFrom || undefined} onChange={(e) => setSalesTo(e.target.value)} style={selectCss} />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[['month', 'This month'], ['30', 'Last 30 days'], ['year', 'This year'], ['', 'All']].map(([k, lbl]) => (
          <button key={lbl} onClick={() => salesPreset(k)} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 600, fontSize: 11.5, padding: '7px 12px', borderRadius: 100, cursor: 'pointer', border: '1px solid rgba(106,78,47,.22)', background: '#fff', color: '#6A4E2F' }}>{lbl}</button>
        ))}
      </div>
      <span style={{ marginLeft: 'auto', fontSize: 12.5, color: '#6c5c47' }}>{(salesFrom || salesTo) ? 'Range: ' : 'All time · '}<b style={{ color: '#6A4E2F' }}>{analytics.count}</b> orders · <b style={{ color: '#6A4E2F' }}>{money(analytics.revenue)}</b></span>
    </div>
  );

  return shell(
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabBtn('overview', 'Overview')}
        {tabBtn('orders', 'Orders')}
        {tabBtn('sales', 'Sales report')}
      </div>

      {view === 'overview' && analytics && (
        <div style={{ display: 'grid', gap: 22 }}>
          {rangeBar}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
            <Tile label="Revenue" value={money(analytics.revenue)} sub={`${analytics.count} orders`} />
            <Tile label="Orders" value={analytics.count} />
            <Tile label="Avg order value" value={money(analytics.avgOrderValue)} />
            <Tile label="Items sold" value={analytics.items} />
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
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: FULFIL[s].fg }}>{analytics.byStatus?.[s] || 0}</div>
                    <div style={{ fontSize: 11.5, color: FULFIL[s].fg, fontWeight: 600 }}>{FULFIL[s].label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...card, padding: '18px 22px' }}>
              <h3 style={{ ...cardHead, marginBottom: 12 }}>Revenue by payment method</h3>
              {Object.keys(analytics.byMethodRevenue).length ? <BarList rows={Object.entries(analytics.byMethodRevenue).sort((a, b) => b[1] - a[1]).map(([m, rev]) => ({ label: METHOD_LABEL[m] || m, value: rev, display: `${money(rev)} · ${analytics.byMethod[m]}` }))} /> : <div style={{ color: '#8a7a63', fontSize: 13 }}>No data.</div>}
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
        <div style={{ display: 'grid', gap: 20 }}>
          {rangeBar}
          {analytics.count === 0 ? (
            <div style={{ ...card, padding: 36, textAlign: 'center', color: '#8a7a63' }}>No sales in this date range.</div>
          ) : (
            <>
              <SalesTable title="Month-wise sales" rows={analytics.byMonth} fmt={(k) => new Date(k + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} />
              <SalesTable title="Day-wise sales" rows={analytics.byDay} fmt={(k) => new Date(k).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
            </>
          )}
        </div>
      )}
    </>
  );
}
