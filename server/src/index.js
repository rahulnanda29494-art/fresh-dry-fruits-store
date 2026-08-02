require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const ordersRouter = require('./routes/orders');
const checkoutRouter = require('./routes/checkout');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/checkout', checkoutRouter);

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
