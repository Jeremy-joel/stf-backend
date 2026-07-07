# Save the Family Foundation — Donations Backend

Handles online donations (M-Pesa + Card via Flutterwave), logs all donations to a database,
and gives you a password-protected admin dashboard with totals, charts, filters, and CSV/Excel export.

---

## Step-by-step setup (starting from zero)

### 1. Install Node.js
Download and install from https://nodejs.org (choose the LTS version). This lets you run the backend on your computer to test it, and is required by Render to run it live.

### 2. Create a free MongoDB Atlas database
1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free).
2. Create a free "M0" cluster (any region close to Kenya, e.g. Frankfurt or Cape Town).
3. Under **Database Access**, create a database user with a username and password (save these).
4. Under **Network Access**, click "Add IP Address" → "Allow Access From Anywhere" (0.0.0.0/0) — needed since Render's IP changes.
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`

### 3. Create a free Flutterwave account
1. Go to https://dashboard.flutterwave.com/signup and sign up as a business (you can use "Save the Family Foundation" as the business name).
2. Complete their KYC verification with your organization's details — this is required before you can receive real payouts.
3. Go to **Settings → API Keys**. Copy your **Public Key** and **Secret Key** (start in **Test Mode** first — there's a toggle — so you can try everything without real money).
4. Go to **Settings → Webhooks**. Set the URL to `https://YOUR-RENDER-URL/api/donations/webhook` (you'll fill this in after deploying in Step 5). Set a "Secret Hash" — make up any random string and save it, you'll need it below.

### 4. Configure your environment variables
1. In this project folder, copy `.env.example` to a new file named `.env`.
2. Fill in:
   - `MONGO_URI` — your Atlas connection string (add your database name at the end, e.g. `.../save_family_foundation`)
   - `JWT_SECRET` — any long random string (e.g. mash your keyboard for 40 characters)
   - `FLW_PUBLIC_KEY` / `FLW_SECRET_KEY` — from Flutterwave
   - `FLW_SECRET_HASH` — the random string you set in Flutterwave's webhook settings
   - `FRONTEND_URL` — the URL where your main website is hosted
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — your own login for the dashboard (change the password to something strong)

### 5. Run it locally first (to test)
```
npm install
npm run seed:admin
npm run dev
```
Visit `http://localhost:5000/admin/login.html` and log in with the admin username/password you set.

### 6. Deploy for real — Render.com
1. Push this project to a GitHub repository (create one at github.com, then follow their instructions to upload this folder).
2. Go to https://render.com, sign up, click **New → Web Service**, and connect your GitHub repo.
3. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Under **Environment**, add every variable from your `.env` file (Render doesn't read the `.env` file itself — you paste each value in manually here).
5. Click **Deploy**. Once live, your admin dashboard is at:
   `https://YOUR-RENDER-URL/admin/login.html`
6. Run the admin seed once in production too: Render → your service → **Shell** tab → run `npm run seed:admin`.
7. Go back to Flutterwave's webhook settings and update the URL to your real Render URL.

### 7. Connect your main website
Follow `FRONTEND-INTEGRATION.md` in this folder — it shows exactly what to paste into your existing `index.html` and `script.js` to add a working "Pay Now" button.

---

## What admins can do
- Log in at `/admin/login.html` (only people with the username/password you set)
- See total raised, donation count, and totals broken down by M-Pesa / Card / Bank Transfer
- See a 6-month bar chart and a payment-method pie chart
- Manually log a donation (e.g. someone reports a bank transfer by phone/email)
- Search and filter all donations by name, status, method, or date range
- Delete incorrect entries
- Export everything to a CSV file that opens directly in Excel

## Folder structure
```
config/db.js              MongoDB connection
models/Donation.js        Donation database schema
models/Admin.js           Admin login schema
controllers/               Business logic (payments, admin actions)
routes/                    API endpoints
middleware/authMiddleware.js   Blocks non-admins from the dashboard API
public/admin/               The dashboard itself (login.html, dashboard.html)
seed/createAdmin.js        Run once to create your first admin login
server.js                  Starts everything
```

## Security notes
- Never share your `.env` file or commit it to GitHub (a `.gitignore` should exclude it).
- Passwords are hashed with bcrypt — even you can't see an admin's raw password once set.
- All online payments are re-verified directly against Flutterwave's servers before being marked "successful" — the frontend alone is never trusted.
- Change `ADMIN_PASSWORD` to something strong before deploying.
