import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useShopFilters } from '../context/ShopFiltersContext';
import { useProducts } from '../context/ProductsContext';
import { CATEGORIES } from '../data/categories';

const iconBtn = {
  position: 'relative', background: '#fff', border: '1px solid rgba(106,78,47,.14)',
  width: 'clamp(36px,3.5vw,44px)', height: 'clamp(36px,3.5vw,44px)', borderRadius: '50%',
  cursor: 'pointer', fontSize: 18, color: '#6A4E2F', display: 'grid', placeItems: 'center', flexShrink: 0,
};

const navBase = {
  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat,sans-serif',
  fontWeight: 600, fontSize: 13, color: '#4a3a26', padding: '6px 2px', borderBottom: '2px solid transparent',
};
const navOn = { ...navBase, color: '#6A4E2F', borderColor: '#D4AF37' };

const menuItem = {
  display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
  padding: '10px 12px', borderRadius: 8, fontFamily: "'Poppins',sans-serif", fontSize: 13.5, color: '#3a2c1a',
};

export default function Nav({ onOpenAuth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const cart = useCart();
  const wishlist = useWishlist();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const filters = useShopFilters();
  const { products } = useProducts();
  const [mega, setMega] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const path = location.pathname;
  const isShopArea = path.startsWith('/shop') || path.startsWith('/product');

  useEffect(() => { setMobileOpen(false); setAccountOpen(false); }, [path]);

  // Close the account dropdown when clicking anywhere outside it.
  useEffect(() => {
    if (!accountOpen) return;
    function onDoc(e) { if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [accountOpen]);

  function goCategory(catName) {
    filters.setCategoryOnly(catName);
    setMega(false);
    navigate('/shop');
  }

  function runSearch() {
    filters.setSearch(searchValue);
    navigate('/shop');
  }

  return (
    <header
      data-surface="nav"
      style={{
        position: 'sticky', top: 0, zIndex: 60,
        background: theme.dark ? 'rgba(26,20,12,.85)' : 'rgba(255,253,248,.82)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(106,78,47,.12)',
      }}
    >
      <nav style={{ maxWidth: 1360, margin: '0 auto', padding: '16px clamp(14px,3vw,32px)', display: 'flex', alignItems: 'center', gap: 'clamp(10px,2vw,28px)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11, padding: 0, flexShrink: 0 }}>
          <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6A4E2F,#3f2e1a)', display: 'grid', placeItems: 'center', color: '#D4AF37', fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 700, boxShadow: '0 6px 18px rgba(106,78,47,.28)', flexShrink: 0 }}>F</span>
          <span style={{ textAlign: 'left', lineHeight: 1, whiteSpace: 'nowrap' }}>
            <span style={{ display: 'block', fontFamily: "'Playfair Display',serif", fontSize: 'clamp(15px,1.6vw,20px)', fontWeight: 700, color: '#6A4E2F', letterSpacing: '.01em', whiteSpace: 'nowrap' }}>Fresh Dry Fruits</span>
            <span className="logo-tagline" style={{ display: 'block', fontFamily: "'Montserrat',sans-serif", fontSize: 8.5, letterSpacing: '.28em', color: '#B08D3E', marginTop: 3, whiteSpace: 'nowrap' }}>NATURE'S FINEST · SINCE 1998</span>
          </span>
        </button>

        <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: 18, marginLeft: 10, fontFamily: "'Montserrat',sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: '.02em', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <button onClick={() => navigate('/')} style={path === '/' ? navOn : navBase}>Home</button>
          <div style={{ position: 'relative' }} onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
            <button onClick={() => navigate('/shop')} style={isShopArea ? navOn : navBase}>Shop ▾</button>
            <div style={{
              position: 'absolute', top: 'calc(100% + 14px)', left: -20, width: 520, background: '#fff',
              borderRadius: 18, boxShadow: '0 30px 70px rgba(106,78,47,.22)', border: '1px solid rgba(106,78,47,.1)',
              padding: 20, opacity: mega ? 1 : 0, visibility: mega ? 'visible' : 'hidden',
              transform: `translateY(${mega ? '0' : '10px'})`, transition: '.25s',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px 34px' }}>
                {CATEGORIES.map((c) => {
                  const count = products.filter((p) => p.category === c.name).length || 3;
                  return (
                    <button
                      key={c.name}
                      className="mega-item"
                      onClick={() => goCategory(c.name)}
                      style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '9px 10px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Poppins',sans-serif", fontSize: 13.5, color: '#3a2c1a', transition: 'background .2s' }}
                    >
                      <span style={{ fontSize: 16 }}>{c.icon}</span>
                      <span>{c.name}<span style={{ display: 'block', fontSize: 11, color: '#a08a63' }}>{count} product{count === 1 ? '' : 's'}</span></span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/about')} style={path === '/about' ? navOn : navBase}>Our Story</button>
          <button onClick={() => navigate('/blog')} style={path === '/blog' ? navOn : navBase}>Journal</button>
          <button onClick={() => navigate('/orders')} style={path === '/orders' ? navOn : navBase}>Orders</button>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'clamp(4px,0.8vw,8px)', flexShrink: 0 }}>
          <div className="nav-search-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid rgba(106,78,47,.16)', borderRadius: 100, padding: '8px 8px 8px 16px', marginRight: 6 }}>
            <span style={{ color: '#B08D3E' }}>⌕</span>
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
              placeholder="Search…"
              style={{ border: 'none', background: 'none', outline: 'none', fontFamily: "'Poppins',sans-serif", fontSize: 13.5, width: 'clamp(80px,9vw,190px)', color: '#3a2c1a' }}
            />
            {searchValue.trim().length > 0 && (
              <button onClick={runSearch} style={{ background: '#6A4E2F', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 11px', fontSize: 11, cursor: 'pointer', fontFamily: "'Montserrat',sans-serif", fontWeight: 600 }}>Go</button>
            )}
          </div>
          <button className="nav-hamburger icon-btn" onClick={() => setMobileOpen((v) => !v)} title="Menu" style={iconBtn}>{mobileOpen ? '✕' : '☰'}</button>
          <button className="icon-btn" onClick={theme.toggleDark} title="Theme" style={iconBtn}>{theme.dark ? '☀' : '☾'}</button>
          <button className="icon-btn" onClick={() => navigate('/shop')} title="Wishlist" style={{ ...iconBtn, flexShrink: 0 }}>
            ♡
            {wishlist.ids.length > 0 && (
              <span style={{ position: 'absolute', top: -2, right: -2, background: '#EA4335', color: '#fff', fontFamily: 'Montserrat,sans-serif', fontSize: 9, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 100, display: 'grid', placeItems: 'center', padding: '0 3px' }}>{wishlist.ids.length}</span>
            )}
          </button>
          <div ref={accountRef} style={{ position: 'relative' }}>
            <button
              className="icon-btn"
              onClick={() => (user ? setAccountOpen((v) => !v) : onOpenAuth())}
              title={user ? `Signed in as ${user.name}` : 'Account'}
              style={{ ...iconBtn, flexShrink: 0, color: user ? '#8BC34A' : '#6A4E2F' }}
            >
              {user ? user.name.trim()[0].toUpperCase() : '◔'}
            </button>
            {user && accountOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 220, background: '#fff', borderRadius: 14, boxShadow: '0 24px 60px rgba(106,78,47,.22)', border: '1px solid rgba(106,78,47,.1)', padding: 8, zIndex: 70 }}>
                <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid rgba(106,78,47,.08)', marginBottom: 4 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#2a1f12', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                  <div style={{ fontSize: 11.5, color: '#8a7a63', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                </div>
                {[
                  ...(user.isAdmin ? [{ label: '📊 Seller dashboard', onClick: () => navigate('/seller') }] : []),
                  { label: 'Manage profile', onClick: () => navigate('/account') },
                  { label: 'Change password', onClick: () => navigate('/account#password') },
                  { label: 'My orders', onClick: () => navigate('/orders') },
                ].map((it) => (
                  <button key={it.label} className="mega-item" onClick={() => { it.onClick(); setAccountOpen(false); }} style={menuItem}>{it.label}</button>
                ))}
                <button onClick={() => { logout(); setAccountOpen(false); navigate('/'); }} style={{ ...menuItem, color: '#EA4335', borderTop: '1px solid rgba(106,78,47,.08)', marginTop: 4, fontWeight: 600 }}>Sign out</button>
              </div>
            )}
          </div>
          <button
            className="nav-cart"
            onClick={cart.openCart}
            title="Cart"
            style={{ position: 'relative', background: '#6A4E2F', color: '#fff', border: 'none', width: 'clamp(36px,3.5vw,44px)', height: 'clamp(36px,3.5vw,44px)', borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'grid', placeItems: 'center', boxShadow: '0 8px 20px rgba(106,78,47,.32)', transition: 'transform .2s', flexShrink: 0 }}
          >
            ⛾
            {cart.count > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#D4AF37', color: '#1A1A1A', fontFamily: 'Montserrat,sans-serif', fontSize: 10, fontWeight: 700, minWidth: 19, height: 19, borderRadius: 100, display: 'grid', placeItems: 'center', padding: '0 4px', border: '2px solid #FFFDF8' }}>{cart.count}</span>
            )}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div style={{ borderTop: '1px solid rgba(106,78,47,.12)', background: theme.dark ? '#1A1A1A' : '#FFFDF8', padding: '16px clamp(14px,3vw,32px) 22px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid rgba(106,78,47,.16)', borderRadius: 100, padding: '10px 8px 10px 16px', marginBottom: 10 }}>
            <span style={{ color: '#B08D3E' }}>⌕</span>
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { runSearch(); setMobileOpen(false); } }}
              placeholder="Search…"
              style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontFamily: "'Poppins',sans-serif", fontSize: 14, color: '#3a2c1a' }}
            />
            {searchValue.trim().length > 0 && (
              <button onClick={() => { runSearch(); setMobileOpen(false); }} style={{ background: '#6A4E2F', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 11, cursor: 'pointer', fontFamily: "'Montserrat',sans-serif", fontWeight: 600 }}>Go</button>
            )}
          </div>
          {[
            { label: 'Home', onClick: () => navigate('/') },
            { label: 'Shop All', onClick: () => navigate('/shop') },
            ...CATEGORIES.map((c) => ({ label: `— ${c.icon} ${c.name}`, onClick: () => goCategory(c.name) })),
            { label: 'Our Story', onClick: () => navigate('/about') },
            { label: 'Journal', onClick: () => navigate('/blog') },
            { label: 'Orders', onClick: () => navigate('/orders') },
            ...(user
              ? [
                  ...(user.isAdmin ? [{ label: '📊 Seller dashboard', onClick: () => navigate('/seller') }] : []),
                  { label: 'Manage profile', onClick: () => navigate('/account') },
                  { label: 'Change password', onClick: () => navigate('/account#password') },
                  { label: 'Sign out', onClick: () => { logout(); navigate('/'); } },
                ]
              : [{ label: 'Sign in / Create account', onClick: () => onOpenAuth() }]),
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => { item.onClick(); setMobileOpen(false); }}
              style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '11px 4px', fontFamily: "'Poppins',sans-serif", fontSize: 14.5, color: item.label === 'Sign out' ? '#EA4335' : '#3a2c1a', borderBottom: '1px solid rgba(106,78,47,.08)' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
