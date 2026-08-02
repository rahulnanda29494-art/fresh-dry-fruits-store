const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn(
    '[razorpay] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set — UPI & card payments will fail until configured (use test-mode keys: rzp_test_...). Cash on Delivery still works.'
  );
}

const instance = keyId && keySecret ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null;

module.exports = { razorpay: instance, keyId: keyId || null, keySecret: keySecret || null };
