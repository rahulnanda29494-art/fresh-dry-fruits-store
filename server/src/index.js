require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const ordersRouter = require('./routes/orders');
const checkoutRouter = require('./routes/checkout');
const adminRouter = require('./routes/admin');

const app = express();
// Behind Render's proxy — needed for correct client IPs (rate limiting) and
// https detection (reset-link URLs).
app.set('trust proxy', 1);
// Security headers. CSP/COEP are disabled because the SPA uses inline styles
// and loads Razorpay Checkout + Google Fonts from other origins.
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());
// Larger limit so admin product-image uploads (base64 data URIs) fit.
app.use(express.json({ limit: '8mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/admin', adminRouter);

// In production the built React app is served from the same origin as the API,
// so the frontend calls a relative `/api` and there's no cross-origin config.
// (In local dev the Vite server on :5173 serves the frontend instead.)
const distPath = path.join(__dirname, '../../web/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Last-resort net: log and keep serving instead of crashing the whole
// process on a stray rejected promise (e.g. a transient DB hiccup).
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Fresh Dry Fruits API listening on :${PORT}`));
