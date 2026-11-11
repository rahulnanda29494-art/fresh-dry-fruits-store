import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const BIZ = {
  name: 'Fresh Dry Fruits',
  legal: 'Fresh Dry Fruits Pvt. Ltd.',
  address: 'Trimbak Road, Nashik, Maharashtra 422002, India',
  email: 'care@freshdryfruits.in',
  phone: '+91 93152 23605',
};

// NOTE: These are standard starting-point policies. Have them reviewed by a
// professional and tailored to your registered business before going live.
const DOCS = {
  terms: {
    title: 'Terms of Service',
    body: [
      ['Overview', `This website is operated by ${BIZ.legal} ("we", "us"). By placing an order or using this site you agree to these Terms. We may update them at any time; the version shown here applies to your use.`],
      ['Orders & pricing', 'All orders are subject to acceptance and product availability. Prices are in Indian Rupees and inclusive of applicable taxes unless stated otherwise. We may cancel or refuse any order, including for suspected fraud or pricing errors, and will refund any amount already charged.'],
      ['Payment', 'Payments are processed by our payment partner (Razorpay) for UPI and cards; Cash on Delivery is also available where offered. We do not store your full card details.'],
      ['Accounts', 'You are responsible for keeping your account credentials secure and for all activity under your account. Provide accurate information at checkout.'],
      ['Product information', 'We take care to describe products accurately, but do not warrant that descriptions, images or weights are error-free. Natural products may vary slightly in appearance.'],
      ['Limitation of liability', 'To the extent permitted by law, our liability for any order is limited to the amount paid for that order. We are not liable for indirect or consequential losses.'],
      ['Governing law', 'These Terms are governed by the laws of India, with exclusive jurisdiction of the courts at Nashik, Maharashtra.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      ['What we collect', 'We collect the information you provide — name, email, phone, shipping address — and order details. Passwords are stored only as secure one-way hashes. We do not store full card numbers; payments are handled by our payment partner.'],
      ['How we use it', 'To process and deliver your orders, provide customer support, send order-related emails, and improve our service. We do not sell your personal data.'],
      ['Sharing', 'We share data only as needed to run the store — e.g. our payment processor (Razorpay), email provider, and delivery partners — and when required by law.'],
      ['Cookies & storage', 'We use your browser’s local storage to keep your cart and sign-in session. These are essential to the shopping experience.'],
      ['Your rights', `You may request access to, correction of, or deletion of your personal data by emailing ${BIZ.email}.`],
      ['Retention & security', 'We retain order records as required for accounting and legal purposes and apply reasonable safeguards to protect your data.'],
    ],
  },
  refund: {
    title: 'Return & Refund Policy',
    body: [
      ['Returns window', 'Being a food product, items can be returned only if they arrive damaged, defective, or incorrect. Report such issues within 7 days of delivery with photos to our support email.'],
      ['Not eligible', 'For hygiene and food-safety reasons, opened or partially consumed packs cannot be returned unless they were defective on arrival.'],
      ['Refunds', 'Approved refunds are issued to the original payment method within 5–7 business days. For Cash on Delivery orders, refunds are made via bank transfer/UPI to details you provide.'],
      ['Cancellations', 'Orders can be cancelled before dispatch for a full refund. Once shipped, the return policy above applies.'],
      ['How to request', `Email ${BIZ.email} or call ${BIZ.phone} with your order number (e.g. #FDF-12345) and photos of the issue.`],
    ],
  },
  shipping: {
    title: 'Shipping Policy',
    body: [
      ['Coverage & timelines', 'We ship across India. Orders are typically dispatched within 1–2 business days and delivered in 2–7 business days depending on location.'],
      ['Charges', 'Shipping is free on orders above ₹1,499. A flat ₹79 applies to smaller orders, shown at checkout before payment.'],
      ['Tracking', 'Order status is visible in your account under Orders. Delivery delays may occur due to weather, courier, or regional factors.'],
      ['Address accuracy', 'Please ensure your shipping address and phone number are correct. We are not responsible for delays or non-delivery due to incorrect details.'],
    ],
  },
};

export default function Legal() {
  const { doc } = useParams();
  const navigate = useNavigate();
  const content = DOCS[doc];
  useEffect(() => { window.scrollTo({ top: 0 }); }, [doc]);

  if (!content) {
    return (
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '80px 28px', textAlign: 'center' }}>
        <p style={{ color: '#6c5c47' }}>Policy not found.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: 16, fontFamily: 'Montserrat,sans-serif', fontWeight: 700, background: '#6A4E2F', color: '#fff', border: 'none', padding: '12px 26px', borderRadius: 100, cursor: 'pointer' }}>Home</button>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 820, margin: '0 auto', padding: '56px 28px 90px' }}>
      <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 12, letterSpacing: '.24em', color: '#B08D3E', fontWeight: 600 }}>LEGAL</span>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 700, color: '#2a1f12', margin: '12px 0 8px' }}>{content.title}</h1>
      <p style={{ color: '#8a7a63', fontSize: 13, marginBottom: 30 }}>Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} · {BIZ.legal}</p>
      <div style={{ display: 'grid', gap: 24 }}>
        {content.body.map(([h, p]) => (
          <div key={h}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#2a1f12', margin: '0 0 8px' }}>{h}</h2>
            <p style={{ color: '#4a3a26', fontSize: 14.5, lineHeight: 1.75, margin: 0 }}>{p}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 40, padding: '18px 20px', background: '#FBF7EE', border: '1px solid #efe6d4', borderRadius: 14, fontSize: 13.5, color: '#6c5c47' }}>
        Questions about this policy? Contact us at <b style={{ color: '#6A4E2F' }}>{BIZ.email}</b> or <b style={{ color: '#6A4E2F' }}>{BIZ.phone}</b> · {BIZ.address}.
      </div>
    </section>
  );
}
