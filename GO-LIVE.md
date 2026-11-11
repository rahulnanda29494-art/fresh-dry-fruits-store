# Go-Live Checklist — Fresh Dry Fruits

Readiness tracker for taking the store live as a real eCommerce business.
Status legend: ✅ done · 🟡 in progress · ⬜ not started · 👤 needs you (business/legal)

---

## 🔴 Blockers — real orders can't happen safely until these are done

- 👤 **Business + payments setup** — register the business, get GST + a current account, complete **Razorpay KYC**, then set live keys (`RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`) in Render. Until then UPI/card record simulated `test-paid` orders (no money moves).
- 🟡 **Legal pages** — Terms of Service, Privacy Policy, Return/Refund Policy, Shipping Policy. *Razorpay requires these to approve a live account.*
- 👤 **Hosting upgrade** — move Render **web service + Postgres off the free tier** (free service sleeps ~20–50s; free DB expires ~90 days) and enable **automated DB backups**.
- 🟡 **Inventory / stock** — track stock per product, prevent overselling, mark out-of-stock.
- 🟡 **Order-confirmation email** to the customer + configure **SMTP** (also powers password-reset emails).
- 👤 **GST invoice** — add the real GSTIN (invoice auto-switches to "TAX INVOICE") once registered.

## 🟡 Important — do shortly before/after launch

- 🟡 **Security hardening** — rate-limit auth endpoints, security headers (helmet), tighten CORS.
- 🟡 **Admin product management** — add/edit/stock products from the seller dashboard (today the catalogue is code-seeded).
- ⬜ **Email verification** on signup.
- ⬜ Replace **demo content** — store address/email, testimonials, reviews, product photos.
- ⬜ **Shipping/logistics** — courier integration + customer-facing tracking.
- ⬜ **Automated tests** for the checkout + payment path.

## 🟢 Nice to have — later

- ⬜ Analytics (GA4 / Plausible) + SEO meta/sitemap.
- ⬜ Wishlist persistence server-side, abandoned-cart email.
- ⬜ Discount/coupon admin (today only `FRESH10` is hardcoded).
- ⬜ Order status emails (shipped/delivered) to customers.

---

## What's already production-grade ✅

- Full commerce path: catalog, filters, cart, coupon, checkout → **real orders in Postgres**.
- Accounts: JWT + guest checkout, profile, change password, forgot/reset password, order history.
- Payments wired through **Razorpay** (UPI + cards) with **server-side signature verification**; COD supported.
- Seller dashboard: all orders, **range-aware analytics**, detailed invoices, shipping status, CSV export, sales reports.
- Security basics: bcrypt password hashing, JWT auth, **server-side price recomputation**, IDOR fixed via `publicToken`.
- Deployed on Render with HTTPS and working auto-deploy from GitHub `main`.
