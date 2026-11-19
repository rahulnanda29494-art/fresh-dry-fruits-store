const nodemailer = require('nodemailer');
const prisma = require('./prisma');

// Email settings come from the DB (editable in the seller dashboard), falling
// back to env vars (SMTP_HOST/PORT/USER/PASS/MAIL_FROM). Resolved per-send and
// cached briefly so dashboard changes take effect within ~15s.
let cache = { at: 0, transport: null, from: null, enabled: false };
const TTL = 15 * 1000;

async function resolveConfig() {
  let s = null;
  try { s = await prisma.emailSettings.findUnique({ where: { id: 1 } }); } catch { /* table may not exist yet */ }
  const host = (s && s.host) || process.env.SMTP_HOST || null;
  const user = (s && s.user) || process.env.SMTP_USER || null;
  const pass = (s && s.pass) || process.env.SMTP_PASS || null;
  const port = Number((s && s.port) || process.env.SMTP_PORT || 465);
  const fromName = (s && s.fromName) || 'Fresh Dry Fruits';
  const fromEmail = (s && s.fromEmail) || user || process.env.MAIL_FROM || null;
  if (!host || !user || !pass || !fromEmail) return null;
  return { host, port, user, pass, from: fromName ? `${fromName} <${fromEmail}>` : fromEmail };
}

async function build() {
  if (Date.now() - cache.at < TTL) return cache;
  const cfg = await resolveConfig();
  cache = {
    at: Date.now(),
    transport: cfg ? nodemailer.createTransport({ host: cfg.host, port: cfg.port, secure: cfg.port !== 587, auth: { user: cfg.user, pass: cfg.pass } }) : null,
    from: cfg ? cfg.from : null,
    enabled: Boolean(cfg),
  };
  return cache;
}

// Call after saving settings so the next send picks them up immediately.
function invalidate() { cache.at = 0; }

async function sendMail({ to, subject, html, text }) {
  const { transport, from } = await build();
  if (!transport) return false;
  await transport.sendMail({ from, to, subject, html, text });
  return true;
}

// Verifies the SMTP login actually works, then sends — used by the dashboard
// "send test" button so it reports the TRUE result (a bad password/host fails
// here instead of silently reporting success).
async function testSend({ to, subject, html, text }) {
  const { transport, from } = await build();
  if (!transport) throw new Error('Email is not fully configured.');
  await transport.verify();
  const info = await transport.sendMail({ from, to, subject, html, text });
  return info;
}

async function emailEnabled() {
  return (await build()).enabled;
}

// Base URL for links inside emails (APP_URL, else the live site).
const APP_URL = (process.env.APP_URL || 'https://fresh-dry-fruits.onrender.com').replace(/\/$/, '');
function trackUrl(orderNo, email) {
  return `${APP_URL}/track?order=FDF-${encodeURIComponent(orderNo)}&email=${encodeURIComponent(email)}`;
}

module.exports = { emailEnabled, sendMail, testSend, invalidate, trackUrl };
