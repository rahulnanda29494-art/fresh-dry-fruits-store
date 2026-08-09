const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
}

// Attaches req.user if a valid Bearer token is present; never rejects.
// Guest checkout is allowed, so auth is optional at the route level.
function attachUser(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}

function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  next();
}

// Seller/admin access is granted to any account whose email is listed in the
// ADMIN_EMAILS env var (comma-separated). Server-side only — never trusted from
// the client. Set it to your own account email to see the seller dashboard.
function isAdminEmail(email) {
  const list = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email) && list.includes(email.toLowerCase());
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (!isAdminEmail(req.user.email)) return res.status(403).json({ error: 'Seller access only' });
  next();
}

module.exports = { signToken, attachUser, requireUser, requireAdmin, isAdminEmail };
