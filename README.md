# Fresh Dry Fruits

A luxury dry-fruits eCommerce site: React (Vite) frontend + Node/Express + PostgreSQL backend, implemented from the Claude Design prototype in `Fresh Dry Fruits.dc.html` in this same folder (see `../chats/` for the design history; the original `.dc.html`/`.js`/`uploads/` prototype source lives alongside this README, kept for reference).

- `web/` — React + Vite frontend (Home, Shop, Product, About, Blog, cart drawer, checkout)
- `server/` — Express API + Prisma/PostgreSQL (products, accounts, orders, Stripe test-mode payments)

All commands below assume you're inside this `project/` folder.

## Setup

### 1. Database

Either run Postgres via Docker:

```bash
docker compose up -d
```

...or point `DATABASE_URL` at any Postgres instance you already have running.

### 2. Backend

```bash
cd server
cp .env.example .env        # fill in DATABASE_URL / JWT_SECRET / STRIPE_SECRET_KEY
npm install
npx prisma migrate dev
npm run seed
npm run dev                 # http://localhost:4000
```

Card checkout needs a Stripe **test-mode** secret key (`sk_test_...`) in `STRIPE_SECRET_KEY` — free at https://dashboard.stripe.com/test/apikeys. Without it, Cash on Delivery and UPI checkout still work; card checkout returns a clear 503 until configured.

### 3. Frontend

```bash
cd web
cp .env.example .env        # VITE_API_URL, VITE_STRIPE_PUBLISHABLE_KEY (pk_test_..., same Stripe account)
npm install
npm run dev                 # http://localhost:5173
```

## What's real vs. scoped out

This implements the **core commerce path** end to end against a real database:
- Product catalog, shop filters/sort, product detail — all served from Postgres via the API.
- Accounts: signup/login (JWT), guest checkout also supported.
- Cart: client-side (persisted to `localStorage`), coupon `FRESH10`.
- Checkout: address → payment → review → confirmation, with **real order rows** persisted server-side. Card payments run through Stripe in test mode (no real money moves); COD and UPI are recorded without a live payment-gateway call.

Deliberately **not** built (out of scope for this pass): admin panel, CMS/blog backend, roles & permissions, warehouses/inventory, gift-card & full coupon engine, order-history/account dashboard UI. The original design brief's full enterprise spec is in `../chats/chat1.md` for reference if any of that is wanted later.
