import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useProducts } from './ProductsContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);
const STORAGE_KEY = 'fdf_cart';
const COUPONS = { FRESH10: 0.1 };

export function CartProvider({ children }) {
  const { bySlug } = useProducts();
  const { showToast } = useToast();

  const [lines, setLines] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0 cart,1 address,2 payment,3 review,4 done
  const [coupon, setCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [lastOrderNo, setLastOrderNo] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  function addToCart(id, qty = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === id);
      return existing
        ? prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l))
        : [...prev, { id, qty }];
    });
    setCartOpen(true);
    setCheckoutStep(0);
    const p = bySlug(id);
    showToast((p ? p.name : 'Item') + ' added to cart');
  }

  function setQty(id, delta) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty: Math.max(1, l.qty + delta) } : l)));
  }

  function removeLine(id) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (code === 'FRESH10') setCouponMsg('✓ 10% off applied!');
    else if (code === '') setCouponMsg('');
    else setCouponMsg('Invalid code');
  }

  function resetCart() {
    setLines([]);
    setCheckoutStep(0);
    setCartOpen(false);
    setCoupon('');
    setCouponMsg('');
  }

  // Order was placed successfully: clear the cart contents but keep the
  // drawer open on the confirmation screen until the user dismisses it.
  function completeOrder(orderNo) {
    setLines([]);
    setLastOrderNo(orderNo);
    setCheckoutStep(4);
  }

  const priced = useMemo(() => {
    const withProduct = lines
      .map((l) => ({ ...l, product: bySlug(l.id) }))
      .filter((l) => l.product);
    const subtotal = withProduct.reduce((t, l) => t + l.product.price * l.qty, 0);
    const couponApplied = couponMsg.startsWith('✓');
    const rate = couponApplied ? COUPONS[coupon.trim().toUpperCase()] || 0 : 0;
    const discount = rate ? Math.round(subtotal * rate) : 0;
    const shipping = subtotal > 1499 || subtotal === 0 ? 0 : 79;
    const total = subtotal - discount + shipping;
    const count = lines.reduce((t, l) => t + l.qty, 0);
    return { withProduct, subtotal, discount, shipping, total, count, couponApplied };
  }, [lines, bySlug, couponMsg, coupon]);

  const value = {
    lines, ...priced,
    cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
    checkoutStep, setCheckoutStep,
    coupon, setCoupon, couponMsg, applyCoupon,
    addToCart, setQty, removeLine, resetCart, completeOrder,
    lastOrderNo, setLastOrderNo,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
