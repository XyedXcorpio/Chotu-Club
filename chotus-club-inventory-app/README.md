# Chotu's Club — Inventory Web App

A login-based inventory and sales tracker for Chotu's Club track suits.
Two roles:

- **Owner** — full access: add/edit products & prices, view all stock
  (store + warehouse), view revenue/profit analytics, log transfers.
- **Store staff** — update store stock, log transfers, view products and
  quantities. Cannot see cost price, sale price, revenue, or profit, and
  cannot touch warehouse stock or add/edit products.

It mirrors the structure of the Excel workbook you already have: Products,
Store Stock, Warehouse Stock, and a Transfer Log that keeps the two stock
sheets in sync — just with a proper login and a dashboard instead of cells.

Both pieces below (Supabase for the database, Vercel for hosting) are free
for a business this size — no card required for either free tier as of
writing.

---

## 1. Set up the database (Supabase — free)

1. Go to https://supabase.com → **Start your project** → sign up (free,
   no card needed) → **New project**.
   - Pick any name (e.g. `chotus-club-inventory`) and a strong database
     password — save that password somewhere, you won't need it day-to-day
     but you may need it later. (Abdulahad.012)
   - Pick a region close to Pakistan (e.g. Singapore) for the best speed.
2. Once the project finishes setting up (~2 minutes), open the **SQL
   Editor** (left sidebar) → **New query**.
3. Open `supabase/schema.sql` from this project, copy its entire contents,
   paste into the SQL editor, and click **Run**. This creates every table,
   view, and security rule in one go. It also adds one example product so
   you can confirm things work before deleting it.
4. Go to **Project Settings → API** (gear icon, bottom left → API). You'll
   need two values from this page in step 3 below:
   - **Project URL** hsbizjhfnndairkgkzmt
   - **anon public** key (NOT the `service_role` key — never use that one
     in this app) eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYml6amhmbm5kYWlya2drem10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3OTc1NjksImV4cCI6MjEwNTM3MzU2OX0.NONHb8_Py8DyVpE1o3E4B_Bpe7FmRIfqxYVV4sSNkNc

### Create your first login (yourself, as Owner)

1. In Supabase, go to **Authentication → Users → Add user → Create new
   user**. Enter your email and a password. (syedhaiderafzal@gmail.com;Qwerty123#) Untick "Auto Confirm" only if
   you want an email confirmation step — for a small internal tool it's
   fine to leave "Auto Confirm" checked so you can log in immediately.
2. This automatically creates a matching row in the `profiles` table with
   role `store_staff` (the safe default). To make yourself the **owner**,
   go to **SQL Editor** and run:
   ```sql
   update public.profiles
   set role = 'owner'
   where id = (select id from auth.users where email = 'your-email@example.com');
   ```
   (Replace the email with the one you just created.)
3. Repeat "Add user" for each staff member. Leave their role as
   `store_staff` — no SQL needed for them. (xyedxcorpio@gmail.com;Qwerty321#)

There's no public sign-up page on purpose — you control who gets an
account, directly in Supabase.

---

## 2. Deploy the app (Vercel — free)

1. Push this project to a GitHub repository (create a new empty repo on
   GitHub, then from this project folder):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
2. Go to https://vercel.com → sign up free with your GitHub account →
   **Add New → Project** → import the repository you just pushed.
3. Vercel auto-detects Next.js — before clicking Deploy, expand
   **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL from step 1.4 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon public key from step 1.4 |

4. Click **Deploy**. After ~2 minutes you'll get a live URL like
   `chotus-club-inventory.vercel.app` — this is the link you and your
   staff will use to log in, from any phone or computer.

That's it — no server to maintain, no monthly cost on either platform at
this scale (Supabase free tier: 500MB database; Vercel free tier: generous
usage limits for a small internal tool).

---

## 3. Using it day to day

- **Add a product**: Owner logs in → Products → New product → fill in SKU,
  name, gender, color, cost price, sale price.
- **Update store stock**: Store Stock page → click a product → edit
  Opening/Received/Sold per size → Save. Both roles can do this.
- **Move stock from warehouse to store**: Transfers page → pick product,
  size, quantity, direction → Log transfer. Both stock sheets update
  automatically, same as the transfer log in the spreadsheet.
- **Warehouse stock**: Owner only, under Warehouse Stock.
- **Dashboard**: Owner sees revenue/profit and low-stock alerts across the
  business; staff see a simpler store-focused view with no money figures.

## 4. Local development (optional, only if you want to make changes)

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase values
npm run dev
```

Open http://localhost:3000.

## 5. What's next

This is v1 of the web app, built to match the Excel workbook's structure
exactly. Natural next additions (tell me what you want and I'll build it
into the same project):
- CSV export of any table
- Editing/undo history on stock changes
- Photo per product
- More roles (e.g. a warehouse-only staff role)
- Low-stock email/WhatsApp alerts
