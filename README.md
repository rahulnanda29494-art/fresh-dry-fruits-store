# Fresh Dry Fruits

A luxury dry-fruits eCommerce site: React (Vite) frontend + Node/Express + PostgreSQL backend.

- `web/` — React + Vite frontend (Home, Shop, Product, About, Blog, cart drawer, checkout, account & order history)
- `server/` — Express API + Prisma/PostgreSQL (products, accounts, orders, Razorpay test-mode payments)

## Deploy (one click)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/rahulnanda29494-art/fresh-dry-fruits-store)

This repo ships a [`render.yaml`](render.yaml) Blueprint that provisions a **PostgreSQL database** and a
single **web service** (the Express server also serves the built React app, so the whole site runs on one
URL). Click the button above, or in the Render dashboard: **New + → Blueprint → pick this repo → Apply**.
Migrations run and the catalogue is seeded automatically on first deploy. Full walkthrough in [DEPLOY.md](DEPLOY.md).

After it's live, set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` in the service's **Environment** tab to enable
real UPI/card charging (see below).

## Run locally

### 1. Database

Run Postgres via Docker (`docker compose up -d`), or point `DATABASE_URL` at any Postgres instance you have.

### 2. Backend

```bash
cd server
cp .env.example .env        # fill in DATABASE_URL / JWT_SECRET / (optional) RAZORPAY keys
npm install
npx prisma migrate dev
npm run seed
npm run dev                 # http://localhost:4000
```

### 3. Frontend

```bash
cd web
cp .env.example .env        # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev                 # http://localhost:5173
```

> On Windows without Docker, see [DEPLOY.md](DEPLOY.md) for the portable-Postgres setup, or just double-click
> `START HERE.cmd` which boots the DB + API + frontend together.

## Payments

Checkout supports **UPI, debit/credit cards, and Cash on Delivery**. UPI and cards run through
**Razorpay** (one gateway); COD is recorded for collection on delivery.

- Set `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` (test-mode keys start with `rzp_test_`, free at
  https://dashboard.razorpay.com/app/keys) to charge for real via Razorpay Checkout.
- **Without keys**, COD works normally and UPI/card record a simulated `test-paid` order — so the full
  checkout flow works in dev/demo before you have a gateway account.

## What's built

The full core commerce path, end to end against a real database:

- Product catalog, shop filters/sort, product detail — served from Postgres via the API.
- **Accounts:** signup / login (JWT), guest checkout, **manage profile, change password, sign out**.
- **Order history** at `/orders` for signed-in users.
- Cart: client-side (persisted to `localStorage`), coupon `FRESH10`.
- Checkout: address → payment → review → confirmation, with **real order rows** persisted server-side.

Out of scope for now: admin panel, CMS/blog backend, roles & permissions, warehouses/inventory, and a
full gift-card/coupon engine.
