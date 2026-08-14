# Fresh Dry Fruits — Project Documentation

A full-stack, production-deployed **luxury dry-fruits eCommerce store**.

- **Live:** https://fresh-dry-fruits.onrender.com
- **Repo:** https://github.com/rahulnanda29494-art/fresh-dry-fruits-store
- **Stack:** React (Vite) · Node/Express · Prisma · PostgreSQL · Razorpay · Render

---

## 1. Overview

Fresh Dry Fruits is a complete online store with a customer-facing storefront and a
private seller dashboard. It supports browsing, cart, accounts, three payment methods
(UPI, card, Cash on Delivery), real persisted orders, password reset, order history,
and a seller back-office with invoicing, sales reports, and shipment tracking.

In production the Express server serves **both** the API (`/api/*`) and the built React
app (everything else), so the whole site runs from a single URL/service.

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6, React Router, plain CSS-in-JS |
| Backend | Node.js (≥20), Express 4 |
| ORM / DB | Prisma 6 → PostgreSQL |
| Auth | JWT (`jsonwebtoken`), `bcryptjs` |
| Payments | Razorpay (UPI + cards), COD |
| Email | Nodemailer (SMTP) — password reset |
| Validation | Zod |
| Hosting | Render (Blueprint: web service + managed Postgres) |

---

## 3. Features

### Customer
- **Catalog** — 9 seeded products, category browse, shop filters (category, price, organic, rating), sort, product detail, search.
- **Cart** — client-side, persisted to `localStorage`; coupon `FRESH10` (10% off).
- **Accounts** — signup / login (JWT, 30-day), guest checkout also supported.
  - Manage profile (name/email), change password, sign out.
  - **Forgot password** — emailed reset link (1-hour, one-time token).
- **Checkout** — address → payment → review → confirmation, creating **real order rows**.
  - **UPI + Card** via Razorpay Checkout; **Cash on Delivery** recorded directly.
- **Order history** (`/orders`) — signed-in users see their own past orders.
- Editorial pages: **Our Story** (`/about`), **Journal** (`/blog`).

### Seller (private, admin-only)
`/seller` — visible only to accounts whose email is in `ADMIN_EMAILS`.
- **Summary tiles** — total orders, revenue, items sold, breakdown by payment method.
- **All orders** table — customer, email, payment + fulfilment status, total; expandable to items + shipping address.
- **Print invoice** — per order, a clean branded invoice opens in a new window and triggers print.
- **Sales report** — month-wise and day-wise totals (orders, items, revenue).
- **Mark shipped** — per-order fulfilment status: Confirmed → Shipped → Delivered (or Cancelled / Reset).

---

## 4. Project structure

```
DRY FRUITS/
├── render.yaml            # Render Blueprint (web service + Postgres)
├── README.md              # quick start + deploy
├── PROJECT.md             # this file
├── server/                # Express API (also serves the built frontend in prod)
│   ├── prisma/
│   │   ├── schema.prisma  # data model
│   │   ├── migrations/    # applied migrations
│   │   └── seed.js        # 9 products (idempotent upsert)
│   └── src/
│       ├── index.js       # app entry, route mounts, static serving
│       ├── lib/           # prisma, razorpay, mailer, pricing, asyncHandler
│       ├── middleware/    # auth (JWT, requireUser, requireAdmin)
│       └── routes/        # products, auth, orders, checkout, admin
└── web/                   # React + Vite frontend
    └── src/
        ├── api/client.js  # typed fetch wrapper for every endpoint
        ├── context/       # Auth, Cart, Products, Wishlist, Theme, Toast, …
        ├── components/    # Nav, CartDrawer, AuthModal, ProductCard, …
        └── pages/         # Home, Shop, ProductDetail, About, Blog,
                           #   Orders, Account, ResetPassword, Seller
```

---

## 5. Data model (Prisma / PostgreSQL)

**User** — `id`, `email` (unique), `passwordHash`, `name`, `createdAt`,
`resetTokenHash?`, `resetTokenExpiry?`, `orders[]`

**Product** — `id`, `slug` (unique), `name`, `category`, `price`, `oldPrice`,
`rating`, `reviews`, `weight`, `badge?`, `organic`, `origin`, `blurb`,
`benefits String[]`, `nutrition Json`, `image`, `bestSeller`, `createdAt`

**Order** — `id`, `orderNo` (unique), `publicToken` (unique, for guest lookup),
`userId?`, `guestEmail?`, `guestName?`, `shippingAddress Json`, `paymentMethod`,
`paymentStatus`, `razorpayOrderId?`, `razorpayPaymentId?`, `couponCode?`,
`subtotal`, `discount`, `shipping`, `total`, `status` (fulfilment), `createdAt`, `items[]`

**OrderItem** — `id`, `orderId`, `productId`, `qty`, `unitPrice`

> All monetary values are **integer rupees** (no decimals). Payment gateway amounts are ×100 (paise).
> `paymentStatus`: `paid` (Razorpay verified) · `test-paid` (no gateway keys) · `cod` · `pending`.
> `status` (fulfilment): `confirmed` · `shipped` · `delivered` · `cancelled`.

---

## 6. API reference

Base URL: `/api`. All responses are JSON. Auth via `Authorization: Bearer <jwt>`.

### Products
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | — | List all products |
| GET | `/products/:slug` | — | Single product |

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Create account → `{token, user}` |
| POST | `/auth/login` | — | Login → `{token, user}` |
| GET | `/auth/me` | user | Current user (refreshes `isAdmin`) |
| PATCH | `/auth/me` | user | Update name/email (re-issues token) |
| POST | `/auth/change-password` | user | Verify current, set new |
| POST | `/auth/forgot-password` | — | Email reset link (generic response) |
| POST | `/auth/reset-password` | — | `{token, newPassword}` → set password |

### Checkout
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/checkout/config` | — | `{razorpayEnabled, keyId}` |
| POST | `/checkout/create-razorpay-order` | opt | Create Razorpay order for cart total |

### Orders
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/orders` | opt | Place order (COD / UPI / card) |
| GET | `/orders` | user | The signed-in user's orders |
| GET | `/orders/by-token/:token` | — | Guest order lookup by `publicToken` |
| GET | `/orders/:orderNo` | opt | Order by number |

### Admin / Seller (requires `ADMIN_EMAILS` match)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/orders` | admin | All orders + summary |
| PATCH | `/admin/orders/:orderNo/status` | admin | Set fulfilment status |

Health: `GET /api/health` → `{ok:true}`.

---

## 7. Authentication & roles

- **JWT** signed with `JWT_SECRET`, payload `{sub, email, name}`, 30-day expiry, stored client-side in `localStorage` (`fdf_auth`).
- `attachUser` attaches `req.user` when a valid token is present (optional — guest checkout allowed); `requireUser` enforces it.
- **Seller/admin** = any account whose email is listed (comma-separated) in `ADMIN_EMAILS`. Checked **server-side** on every admin request (`requireAdmin`) and surfaced to the UI as `user.isAdmin`. Never client-trusted.

---

## 8. Payments

One gateway, **Razorpay**, handles UPI + debit/credit cards; **COD** is recorded for collection.

- **Flow:** client requests a Razorpay order (`/checkout/create-razorpay-order`) → Razorpay Checkout modal → on success the client sends `razorpayOrderId/PaymentId/Signature` to `/orders` → server **verifies the HMAC signature and re-fetches the payment** to confirm amount + capture before marking `paid`.
- **Cart totals are always recomputed server-side** from DB prices — client amounts are never trusted.
- **Test-mode fallback:** with no `RAZORPAY_KEY_ID`/`SECRET` set, UPI/card record a simulated `test-paid` order so the full checkout works in dev/demo. Add real test keys (`rzp_test_…`) to charge for real. COD always works.

---

## 9. Password reset (email)

- `forgot-password` issues a SHA-256-hashed, 1-hour, one-time token and emails a link (`/reset-password?token=…`) via Nodemailer/SMTP. Response is always generic (never reveals whether an account exists).
- Without SMTP configured: in **dev** the link is returned in the response for testing; in **production** nothing is exposed (email is required to deliver it).
- `reset-password` verifies the token + expiry, sets the new password, and clears the token.

---

## 10. Environment variables

### `server/.env`
| Key | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Signs JWTs |
| `PORT` | — | API port (default 4000; Render sets its own) |
| `ADMIN_EMAILS` | for seller | Comma-separated seller/admin emails |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | for live pay | Razorpay test/live keys |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` | for reset email | SMTP delivery (e.g. Gmail App Password) |
| `APP_URL` | — | Base URL for email links (else derived from request) |

### `web/.env`
| Key | Purpose |
|---|---|
| `VITE_API_URL` | API base (dev: `http://localhost:4000/api`). In the production build it defaults to same-origin `/api`. |

> `.env` files are git-ignored. `.env.example` templates are committed in `server/` and `web/`.

---

## 11. Local development

Requires Node ≥20 and a PostgreSQL instance.

```bash
# 1. Database — Docker, or any Postgres (Windows portable Postgres also works)
docker compose up -d

# 2. Backend
cd server
cp .env.example .env        # fill DATABASE_URL / JWT_SECRET (+ optional keys)
npm install
npx prisma migrate dev
npm run seed                # 9 products
npm run dev                 # http://localhost:4000

# 3. Frontend
cd ../web
cp .env.example .env        # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev                 # http://localhost:5173
```

> On Windows without Docker, a portable Postgres + `START HERE.cmd` boots DB + API + web together.

### Server scripts
`npm run dev` (watch) · `npm start` · `npm run seed` · `npm run prisma:generate` · `npm run prisma:migrate` · `npm run prisma:deploy`

---

## 12. Deployment (Render)

The repo ships [`render.yaml`](render.yaml) — a Blueprint that provisions a **PostgreSQL
database** and one **web service** that builds the frontend, runs migrations, seeds, and
serves API + static app together.

**Deploy:** Render → New + → **Blueprint** → pick the repo → **Apply** (or the "Deploy to
Render" button in the README). Migrations + seed run automatically on first deploy.

**Build command** installs dev dependencies explicitly (`--include=dev`) because
`NODE_ENV=production` otherwise skips Vite and the Prisma CLI.

**Post-deploy config (Render → service → Environment):**
- `ADMIN_EMAILS` = your account email → unlocks the seller dashboard (then sign out/in).
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` → real UPI/card charging.
- `SMTP_*` → real password-reset emails.

> Changing env vars auto-redeploys the service. Code pushes currently need **Manual Deploy →
> Deploy latest commit** (the GitHub auto-deploy webhook is not connected).

---

## 13. Known limitations / not yet built

- Admin **product/inventory** management (catalog is seeded), CMS/blog backend.
- Live payments and reset emails are **test-mode until keys are configured**.
- **GitHub → Render auto-deploy** webhook is disconnected — deploys are manual.
- Free-tier Render: the service sleeps when idle (~50s cold start); free Postgres expires after 90 days.
- A legacy `stripePaymentIntentId` column remains on `Order` (nullable, unused — Stripe was replaced by Razorpay).

---

## 14. Credits

Built iteratively with Claude Code. Editorial photos are Unsplash-licensed (free for commercial use).
