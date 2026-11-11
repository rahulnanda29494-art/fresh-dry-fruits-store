import { useNavigate } from 'react-router-dom';

const linkStyle = { display: 'block', color: '#b6a988', fontSize: 14, marginBottom: 11 };
const headingStyle = { fontFamily: "'Montserrat',sans-serif", fontSize: 12, letterSpacing: '.16em', color: '#D4AF37', marginBottom: 16 };

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer data-surface="footer" style={{ background: '#1A1A1A', color: '#d8cdb8', padding: '72px 32px 30px' }}>
      <div className="footer-grid" style={{ maxWidth: 1360, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 40 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#D4AF37,#b8901f)', display: 'grid', placeItems: 'center', color: '#1A1A1A', fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 700 }}>F</span>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#fff' }}>Fresh Dry Fruits</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: '18px 0 0', maxWidth: 320, color: '#a89a80' }}>
            Nature's finest dry fruits, delivered fresh from orchard to doorstep since 1998. Purity you can taste.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
            {['📷', '𝕏', 'f', '▶'].map((icon) => (
              <a key={icon} href="#" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.08)', display: 'grid', placeItems: 'center', color: '#d8cdb8' }}>{icon}</a>
            ))}
          </div>
        </div>
        <div>
          <h4 style={headingStyle}>SHOP</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/shop'); }} style={linkStyle}>All Products</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/shop'); }} style={linkStyle}>Best Sellers</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/shop'); }} style={linkStyle}>Gift Boxes</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/shop'); }} style={linkStyle}>Organic Collection</a>
        </div>
        <div>
          <h4 style={headingStyle}>COMPANY</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/about'); }} style={linkStyle}>Our Story</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/blog'); }} style={linkStyle}>Journal</a>
          <a href="#" style={linkStyle}>Our Farms</a>
          <a href="#" style={linkStyle}>Contact</a>
        </div>
        <div>
          <h4 style={headingStyle}>SUPPORT</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/orders'); }} style={linkStyle}>Track Order</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/legal/shipping'); }} style={linkStyle}>Shipping Policy</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/legal/refund'); }} style={linkStyle}>Returns & Refunds</a>
          <a href="https://wa.me/919315223605" target="_blank" rel="noreferrer" style={linkStyle}>WhatsApp Us</a>
        </div>
      </div>
      <div style={{ maxWidth: 1360, margin: '44px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.1)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, fontSize: 12.5, color: '#8a7d64' }}>
        <span>© 2026 Fresh Dry Fruits. All rights reserved.</span>
        <span style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          {[['Terms', 'terms'], ['Privacy', 'privacy'], ['Refund', 'refund'], ['Shipping', 'shipping']].map(([lbl, slug]) => (
            <a key={slug} href="#" onClick={(e) => { e.preventDefault(); navigate(`/legal/${slug}`); }} style={{ color: '#8a7d64', textDecoration: 'none' }}>{lbl}</a>
          ))}
        </span>
        <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>Secure payments · UPI · Cards · Razorpay · COD</span>
      </div>
    </footer>
  );
}
