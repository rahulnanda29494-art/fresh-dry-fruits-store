import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { ToastProvider } from './context/ToastContext';
import { ProductsProvider } from './context/ProductsContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider, useCart } from './context/CartContext';
import { QuickViewProvider, useQuickView } from './context/QuickViewContext';
import { ShopFiltersProvider } from './context/ShopFiltersContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import AnnouncementBar from './components/AnnouncementBar';
import Nav from './components/Nav';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import CartDrawer from './components/CartDrawer';
import QuickView from './components/QuickView';
import AuthModal from './components/AuthModal';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Blog from './pages/Blog';
import Orders from './pages/Orders';
import Account from './pages/Account';
import ResetPassword from './pages/ResetPassword';
import Seller from './pages/Seller';
import Legal from './pages/Legal';
import Track from './pages/Track';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

function Shell() {
  const theme = useTheme();
  const cart = useCart();
  const quickView = useQuickView();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div data-surface="page" style={{ minHeight: '100vh', background: theme.dark ? '#1A1A1A' : '#FFFDF8', position: 'relative', overflowX: 'hidden', transition: 'background .3s' }}>
      <ScrollToTop />
      <AnnouncementBar />
      <Nav onOpenAuth={() => setAuthOpen(true)} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/account" element={<Account />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/seller" element={<Seller />} />
          <Route path="/legal/:doc" element={<Legal />} />
          <Route path="/track" element={<Track />} />
        </Routes>
      </main>
      <Footer />

      <div
        onClick={cart.closeCart}
        style={{
          position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(26,20,12,.5)', backdropFilter: 'blur(3px)',
          opacity: cart.cartOpen ? 1 : 0, visibility: cart.cartOpen ? 'visible' : 'hidden', transition: '.3s',
        }}
      />
      <aside
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 81, width: 'min(420px,92vw)',
          background: '#FFFDF8', boxShadow: '-20px 0 60px rgba(0,0,0,.25)',
          transform: `translateX(${cart.cartOpen ? '0' : '100%'})`, transition: 'transform .4s cubic-bezier(.4,0,.1,1)',
        }}
      >
        <CartDrawer />
      </aside>

      {quickView.quickId && <QuickView />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ProductsProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <QuickViewProvider>
                <ShopFiltersProvider>
                  <ThemeProvider>
                    <Shell />
                  </ThemeProvider>
                </ShopFiltersProvider>
              </QuickViewProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ProductsProvider>
    </ToastProvider>
  );
}
