const nodemailer = require('nodemailer');

// Configured entirely from env. Set SMTP_HOST/PORT/USER/PASS (and optionally
// MAIL_FROM) to send real email — e.g. Gmail: host smtp.gmail.com, port 465,
// user your address, pass a Google "App Password". Without these, emailEnabled
// is false and callers fall back to showing the reset link directly (dev only).
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

const emailEnabled = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transport = emailEnabled
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 465,
      secure: Number(SMTP_PORT) !== 587, // 465 = implicit TLS, 587 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

if (!emailEnabled) {
  console.warn('[mailer] SMTP not configured — password-reset emails will not be sent (reset links are shown on-screen in dev instead). Set SMTP_HOST/SMTP_USER/SMTP_PASS to enable.');
}

async function sendMail({ to, subject, html, text }) {
  if (!transport) return false;
  await transport.sendMail({ from: MAIL_FROM || SMTP_USER, to, subject, html, text });
  return true;
}

module.exports = { emailEnabled, sendMail };
