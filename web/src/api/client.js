// Dev: talk to the local API on :4000. Production build: same-origin `/api`
// (the Express server serves the built frontend), so no cross-origin config.
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:4000/api');

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  getProducts: () => request('/products'),
  getProduct: (slug) => request(`/products/${slug}`),
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
  forgotPassword: (payload) => request('/auth/forgot-password', { method: 'POST', body: payload }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: payload }),
  updateProfile: (payload, token) => request('/auth/me', { method: 'PATCH', body: payload, token }),
  changePassword: (payload, token) => request('/auth/change-password', { method: 'POST', body: payload, token }),
  getCheckoutConfig: () => request('/checkout/config'),
  createRazorpayOrder: (payload, token) => request('/checkout/create-razorpay-order', { method: 'POST', body: payload, token }),
  createOrder: (payload, token) => request('/orders', { method: 'POST', body: payload, token }),
  getMyOrders: (token) => request('/orders', { token }),
  // By order number: signed-in owner only. By token: the confirmation lookup,
  // which also works for guests — the token comes back from createOrder.
  getOrder: (orderNo, token) => request(`/orders/${orderNo}`, { token }),
  getOrderByToken: (publicToken) => request(`/orders/by-token/${publicToken}`),
};
