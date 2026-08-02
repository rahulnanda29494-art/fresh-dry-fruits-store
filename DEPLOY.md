# Deploying Fresh Dry Fruits to Render

This app deploys as **one Render web service** (the Express server serves both the
API and the built React frontend) plus a **managed PostgreSQL** database. The
[`render.yaml`](render.yaml) Blueprint wires it all together.

## One-time deploy

1. **Push this repo to GitHub** (if not already):
   ```bash
   git push -u origin main
   ```

2. **Create the Render Blueprint**
   - Go to <https://dashboard.render.com> → **New +** → **Blueprint**.
   - Connect your GitHub account and pick this repository.
   - Render reads `render.yaml` and shows: a Postgres database + a web service.
   - Click **Apply**. First build takes ~3–5 min (installs deps, builds the
     frontend, runs migrations, seeds 9 products).

3. **Open your site** — Render gives the web service a URL like
   `https://fresh-dry-fruits.onrender.com`. That single URL serves the whole app.

That's it. `JWT_SECRET` is generated automatically; `DATABASE_URL` is injected
from the managed database.

## Enabling real UPI / card payments (optional)

Checkout works out of the box with **Cash on Delivery**, and UPI/card record
**simulated `test-paid`** orders. To charge for real:

1. Get test (or live) keys at <https://dashboard.razorpay.com/app/keys>.
2. In Render → your web service → **Environment**, set:
   - `RAZORPAY_KEY_ID` = `rzp_test_...`
   - `RAZORPAY_KEY_SECRET` = `...`
3. Save — Render redeploys and the Razorpay checkout modal goes live.

## Notes & gotchas

- **Free tier sleeps.** The free web service spins down after ~15 min idle; the
  next visit has a ~50s cold start. Upgrade the service to a paid instance to
  keep it always-on.
- **Free Postgres expires after 90 days.** Render will email you; upgrade the
  database (~$7/mo) or export/recreate before then to keep your data.
- **Region.** Defaults to Oregon (US). For India latency, change the region on
  both the database and web service in the dashboard (keep them the same).
- **Redeploys are automatic** on every `git push` to the connected branch.
  Migrations (`prisma migrate deploy`) and the idempotent seed run each build.

## Local development

See [README.md](README.md) — or on Windows, double-click `START HERE.cmd`.
