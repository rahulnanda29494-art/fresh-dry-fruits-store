const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { signToken, attachUser, requireUser, isAdminEmail } = require('../middleware/auth');
const { emailEnabled, sendMail } = require('../lib/mailer');
const asyncHandler = require('../lib/asyncHandler');

const router = express.Router();

const signupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const profileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const resetSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, isAdmin: isAdminEmail(u.email) };
}

router.post('/signup', asyncHandler(async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

  res.json({ token: signToken(user), user: publicUser(user) });
}));

router.get('/me', attachUser, requireUser, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(user) });
}));

// Update the signed-in user's name/email. Re-issues the token so the JWT's
// embedded name/email (used for display) stay in sync.
router.patch('/me', attachUser, requireUser, asyncHandler(async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { name, email } = parsed.data;

  const clash = await prisma.user.findFirst({ where: { email, NOT: { id: req.user.sub } } });
  if (clash) return res.status(409).json({ error: 'That email is already in use by another account' });

  const user = await prisma.user.update({ where: { id: req.user.sub }, data: { name, email } });
  res.json({ token: signToken(user), user: publicUser(user) });
}));

// Change the signed-in user's password after verifying the current one.
router.post('/change-password', attachUser, requireUser, asyncHandler(async (req, res) => {
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  res.json({ ok: true });
}));

// Request a password reset. Always responds success (never reveals whether an
// account exists). If the account exists, stores a hashed, 1-hour token and
// emails a reset link — or, when no SMTP is configured in dev, returns the link.
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { email } = parsed.data;

  const generic = { ok: true, message: 'If an account exists for that email, a password reset link has been sent.' };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.json(generic);

  const token = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await prisma.user.update({ where: { id: user.id }, data: { resetTokenHash, resetTokenExpiry } });

  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const base = process.env.APP_URL || `${proto}://${req.get('host')}`;
  const resetUrl = `${base}/reset-password?token=${token}`;

  if (emailEnabled) {
    await sendMail({
      to: email,
      subject: 'Reset your Fresh Dry Fruits password',
      text: `We received a request to reset your password.\n\nReset it here: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
      html: `<p>We received a request to reset your Fresh Dry Fruits password.</p>
             <p><a href="${resetUrl}">Click here to set a new password</a> — this link expires in 1 hour.</p>
             <p>If you didn't request this, you can safely ignore this email.</p>`,
    });
    return res.json(generic);
  }

  // No email provider configured: return the link so the flow is usable, but
  // only outside production (never leak reset links on the live site).
  if (process.env.NODE_ENV !== 'production') {
    return res.json({ ...generic, devResetUrl: resetUrl });
  }
  return res.json(generic);
}));

// Complete a password reset using the token from the emailed link.
router.post('/reset-password', asyncHandler(async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { token, newPassword } = parsed.data;

  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({
    where: { resetTokenHash, resetTokenExpiry: { gt: new Date() } },
  });
  if (!user) return res.status(400).json({ error: 'This reset link is invalid or has expired. Please request a new one.' });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetTokenHash: null, resetTokenExpiry: null },
  });
  res.json({ ok: true });
}));

module.exports = router;
