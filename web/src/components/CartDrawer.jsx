import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { money } from '../utils/format';
import { loadRazorpayScript } from '../lib/razorpayClient';
import ProductImage from './ProductImage';

const inputStyle = {
  border: '1px solid rgba(106,78,47,.2)', borderRadius: 12, padding: '13px 16px',
  fontFamily: 'Poppins,sans-serif', fontSize: 13.5, outline: 'none', width: '100%',
};

const STEP_LABELS = ['Cart', 'Address', 'Payment', 'Review'];

function toOrderItems(lines) {
  return lines.map((l) => ({ productSlug: l.id, qty: l.qty }));
}

export default function CartDrawer() {
  const cart = useCart();
  const wishlist = useWishlist();
  const { token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState({ fullName: '', phone: '', line1: '', city: '', pin: '' });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [gatewayLive, setGatewayLive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stepError, setStepError] = useState('');

  // Ask the server whether a real Razorpay gateway is configured. Only used to
  // show an honest note in the UI — checkout works either way.
  useEffect(() => {
    api.getCheckoutConfig().then((c) => setGatewayLive(Boolean(c.razorpayEnabled))).catch(() => {});
  }, []);

  const step = cart.checkoutStep;
  const empty = cart.lines.length === 0 && step < 4;
  const showBody = cart.lines.length > 0 && step < 4;
  const done = step === 4;

  function moveToWish(id) {
    wishlist.add(id);
    cart.removeLine(id);
    showToast('Moved to wishlist');
  }

  async function goAddress() {
    setStepError('');
    cart.setCheckoutStep(1);
  }

  async function goPayment() {
    setStepError('');
    const { fullName, phone, line1, city, pin } = address;
    if (!fullName.trim() || !phone.trim() || !line1.trim() || !city.trim() || !pin.trim()) {
      setStepError('Please fill in all address fields.');
      return;
    }
    cart.setCheckoutStep(2);
  }

  async function goReview() {
    setStepError('');
    cart.setCheckoutStep(3);
  }

  // Persists the order. `payment` carries the Razorpay proof for card/upi when
  // the live gateway is used; empty for COD or test-mode.
  async function submitOrder(payment) {
    try {
      const order = await api.createOrder({
        items: toOrderItems(cart.lines),
        couponCode: cart.couponApplied ? cart.coupon : undefined,
        address,
        paymentMethod,
        ...payment,
      }, token);
      cart.completeOrder(order.orderNo);
    } catch (err) {
      setStepError(err.message);
      setBusy(false);
    }
  }

  async function placeOrder() {
    setStepError('');
    setBusy(true);

    // Cash on Delivery: nothing to charge.
    if (paymentMethod === 'cod') {
      return submitOrder({});
    }

    // Card / UPI: try to open the live Razorpay gateway. If the server has no
    // keys configured it returns 503 — fall back to a test-mode order so the
    // flow still completes in dev.
    let rzp;
    try {
      rzp = await api.createRazorpayOrder(
        { items: toOrderItems(cart.lines), couponCode: cart.couponApplied ? cart.coupon : undefined },
        token
      );
    } catch (err) {
      if (/not configured|503/i.test(err.message)) {
        return submitOrder({}); // test-mode (no gateway keys)
      }
      setStepError(err.message);
      setBusy(false);
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      setStepError('Could not load the payment gateway. Check your connection and try again.');
      setBusy(false);
      return;
    }

    const checkout = new window.Razorpay({
      key: rzp.keyId,
      amount: rzp.amount,
      currency: rzp.currency || 'INR',
      order_id: rzp.razorpayOrderId,
      name: 'Fresh Dry Fruits',
      description: `Order payment (${paymentMethod.toUpperCase()})`,
      prefill: { name: address.fullName, contact: address.phone, method: paymentMethod === 'upi' ? 'upi' : 'card' },
      theme: { color: '#6A4E2F' },
      handler: (resp) => submitOrder({
        razorpayOrderId: resp.razorpay_order_id,
        razorpayPaymentId: resp.razorpay_payment_id,
        razorpaySignature: resp.razorpay_signature,
      }),
      modal: { ondismiss: () => { setBusy(false); setStepError('Payment cancelled.'); } },
    });
    checkout.on('payment.failed', (r) => { setBusy(false); setStepError(r.error?.description || 'Payment failed. Please try again.'); });
    checkout.open();
  }

  function back() {
    setStepError('');
    cart.setCheckoutStep(Math.max(0, step - 1));
  }

  function primary() {
    if (busy) return;
    if (step === 0) return goAddress();
    if (step === 1) return goPayment();
    if (step === 2) return goReview();
    if (step === 3) return placeOrder();
  }

  const primaryLabel = busy
    ? 'Please wait…'
    : step === 0 ? 'Proceed to Address'
    : step === 1 ? 'Proceed to Payment'
    : step === 2 ? 'Review Order'
    : 'Place Order';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Poppins',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px', borderBottom: '1px solid rgba(106,78,47,.12)' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#2a1f12' }}>
          Your Cart <span style={{ color: '#B08D3E', fontSize: 15 }}>({cart.count})</span>
        </div>
        <button onClick={cart.closeCart} style={{ background: '#F5EFE2', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 16, color: '#6A4E2F' }}>✕</button>
      </div>

      {empty && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40, gap: 16 }}>
          <div style={{ fontSize: 52 }}>🛍️</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: '#2a1f12' }}>Your cart is empty</div>
          <p style={{ color: '#8a7a63', fontSize: 14 }}>Discover our most-loved dry fruits and gift boxes.</p>
          <button onClick={() => { cart.closeCart(); navigate('/shop'); }} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, background: '#6A4E2F', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: 100, cursor: 'pointer' }}>
            Start Shopping
          </button>
        </div>
      )}

      {done && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40, gap: 14 }}>
          <div style={{ width: 78, height: 78, borderRadius: '50%', background: '#EAF3DC', display: 'grid', placeItems: 'center', fontSize: 38, color: '#34A853' }}>✓</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: '#2a1f12' }}>Order confirmed!</div>
          <p style={{ color: '#8a7a63', fontSize: 14, maxWidth: 280 }}>
            Thank you. Order <b style={{ color: '#6A4E2F' }}>#FDF-{cart.lastOrderNo}</b> is on its way. A confirmation is in your inbox.
          </p>
          <button onClick={cart.resetCart} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, background: '#6A4E2F', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: 100, cursor: 'pointer' }}>
            Continue Shopping
          </button>
        </div>
      )}

      {showBody && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', gap: 6, padding: '14px 24px', borderBottom: '1px solid rgba(106,78,47,.08)' }}>
            {STEP_LABELS.map((label, i) => (
              <div key={label} style={{
                flex: 1, textAlign: 'center', fontFamily: 'Montserrat,sans-serif', fontSize: 10.5, fontWeight: 700,
                letterSpacing: '.04em', padding: '8px 4px', borderRadius: 8,
                color: i === step ? '#6A4E2F' : '#b0a288', background: i === step ? '#F5EFE2' : 'transparent',
              }}>
                {label}
              </div>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px' }}>
            {step === 0 && (
              <div>
                {cart.withProduct.map((l) => (
                  <div key={l.id} style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid rgba(106,78,47,.08)' }}>
                    <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F5EFE2' }}>
                      <ProductImage imageKey={l.product.image} alt={l.product.name} label="·" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: '#2a1f12', lineHeight: 1.3 }}>{l.product.name}</div>
                      <div style={{ fontSize: 12, color: '#8a7a63', marginTop: 2 }}>{l.product.weight} · {money(l.product.price)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(106,78,47,.2)', borderRadius: 100, overflow: 'hidden' }}>
                          <button onClick={() => cart.setQty(l.id, -1)} style={{ border: 'none', background: 'none', width: 28, height: 28, cursor: 'pointer', fontSize: 16, color: '#6A4E2F' }}>−</button>
                          <span style={{ minWidth: 22, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{l.qty}</span>
                          <button onClick={() => cart.setQty(l.id, 1)} style={{ border: 'none', background: 'none', width: 28, height: 28, cursor: 'pointer', fontSize: 16, color: '#6A4E2F' }}>+</button>
                        </div>
                        <button onClick={() => moveToWish(l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#8a7a63', textDecoration: 'underline' }}>Save</button>
                        <button onClick={() => cart.removeLine(l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#EA4335', textDecoration: 'underline' }}>Remove</button>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#6A4E2F', fontSize: 15 }}>{money(l.product.price * l.qty)}</div>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 8, margin: '18px 0' }}>
                  <input value={cart.coupon} onChange={(e) => cart.setCoupon(e.target.value)} placeholder="Coupon code (try FRESH10)" style={{ flex: 1, border: '1px solid rgba(106,78,47,.2)', borderRadius: 100, padding: '11px 16px', fontFamily: "'Poppins',sans-serif", fontSize: 13, outline: 'none' }} />
                  <button onClick={cart.applyCoupon} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 600, fontSize: 12, background: '#1A1A1A', color: '#fff', border: 'none', padding: '0 18px', borderRadius: 100, cursor: 'pointer' }}>Apply</button>
                </div>
                <div style={{ fontSize: 12, color: '#34A853', minHeight: 16 }}>{cart.couponMsg}</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFF6E3', border: '1px solid rgba(212,175,55,.35)', borderRadius: 12, padding: '12px 14px', marginTop: 8, cursor: 'pointer', fontSize: 13, color: '#6c5c47' }}>
                  <span style={{ fontSize: 18 }}>🎁</span> Add a luxury gift wrap <b style={{ marginLeft: 'auto', color: '#6A4E2F' }}>+₹99</b>
                </label>
              </div>
            )}

            {step === 1 && (
              <div style={{ paddingTop: 12 }}>
                <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 13, color: '#6A4E2F', letterSpacing: '.06em', marginBottom: 14 }}>SHIPPING ADDRESS</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <input placeholder="Full name" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} style={inputStyle} />
                  <input placeholder="Phone number" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} style={inputStyle} />
                  <input placeholder="Address line" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} style={inputStyle} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} style={inputStyle} />
                    <input placeholder="PIN code" value={address.pin} onChange={(e) => setAddress({ ...address, pin: e.target.value })} style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ paddingTop: 12 }}>
                <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 13, color: '#6A4E2F', letterSpacing: '.06em', marginBottom: 14 }}>PAYMENT METHOD</div>
                {[
                  { key: 'upi', icon: '📱', label: 'UPI', hint: 'Pay with any UPI app or QR — Google Pay, PhonePe, Paytm & more.' },
                  { key: 'card', icon: '💳', label: 'Credit / Debit Card', hint: 'Visa, Mastercard, RuPay & more, entered in a secure popup.' },
                  { key: 'cod', icon: '💰', label: 'Cash on Delivery', hint: 'Pay in cash when your order arrives.' },
                ].map((m) => (
                  <label
                    key={m.key}
                    onClick={() => setPaymentMethod(m.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                      border: '1.5px solid ' + (paymentMethod === m.key ? '#6A4E2F' : 'rgba(106,78,47,.15)'),
                      borderRadius: 14, marginBottom: 10, cursor: 'pointer', fontSize: 13.5, color: '#3a2c1a',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{m.icon}</span> {m.label}
                    <span style={{ marginLeft: 'auto', color: '#8BC34A' }}>{paymentMethod === m.key ? '✓' : ''}</span>
                  </label>
                ))}
                <div style={{ fontSize: 12, color: '#8a7a63', marginTop: 4, lineHeight: 1.6 }}>
                  {paymentMethod === 'upi' && '📱 Pay with any UPI app or QR — Google Pay, PhonePe, Paytm & more.'}
                  {paymentMethod === 'card' && '💳 Visa, Mastercard, RuPay & more, entered in a secure popup.'}
                  {paymentMethod === 'cod' && '💰 Pay in cash when your order arrives.'}
                </div>
                {paymentMethod !== 'cod' && !gatewayLive && (
                  <div style={{ marginTop: 12, padding: '10px 12px', background: '#FFF6E3', border: '1px solid rgba(212,175,55,.4)', borderRadius: 10, fontSize: 11.5, color: '#8a6d2f', lineHeight: 1.6 }}>
                    Test mode — no live payment gateway is configured, so this records a simulated payment. Add Razorpay keys on the server to charge for real.
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div style={{ paddingTop: 12 }}>
                <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 13, color: '#6A4E2F', letterSpacing: '.06em', marginBottom: 14 }}>REVIEW ORDER</div>
                {cart.withProduct.map((l) => (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, color: '#4a3a26' }}>
                    <span>{l.qty} × {l.product.name}</span><b>{money(l.product.price * l.qty)}</b>
                  </div>
                ))}
                <div style={{ marginTop: 10, padding: 12, background: '#EAF3DC', borderRadius: 12, fontSize: 12.5, color: '#4a6b2a' }}>
                  ✓ Delivering in 2–4 business days · Free returns within 7 days
                </div>
              </div>
            )}

            {stepError && <div style={{ color: '#EA4335', fontSize: 12.5, marginTop: 12 }}>{stepError}</div>}
          </div>

          <div style={{ borderTop: '1px solid rgba(106,78,47,.12)', padding: '18px 24px 22px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6c5c47', marginBottom: 6 }}><span>Subtotal</span><span>{money(cart.subtotal)}</span></div>
            {cart.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#34A853', marginBottom: 6 }}><span>Discount</span><span>−{money(cart.discount)}</span></div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6c5c47', marginBottom: 10 }}><span>Shipping</span><span>{cart.shipping === 0 ? 'FREE' : money(cart.shipping)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 10, borderTop: '1px dashed rgba(106,78,47,.2)' }}>
              <span style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, color: '#2a1f12' }}>Total</span>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#6A4E2F' }}>{money(cart.total)}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {step > 0 && (
                <button onClick={back} disabled={busy} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 600, fontSize: 14, background: '#fff', color: '#6A4E2F', border: '1.5px solid rgba(106,78,47,.3)', padding: '15px 20px', borderRadius: 100, cursor: 'pointer' }}>
                  Back
                </button>
              )}
              <button onClick={primary} disabled={busy} style={{ flex: 1, fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, background: '#6A4E2F', color: '#fff', border: 'none', padding: 15, borderRadius: 100, cursor: busy ? 'default' : 'pointer', boxShadow: '0 12px 26px rgba(106,78,47,.3)', opacity: busy ? 0.7 : 1 }}>
                {primaryLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
