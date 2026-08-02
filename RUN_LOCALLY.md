# Run DreamNest locally (MERN)

## Terminal 1 — Backend (`server/`)

```powershell
cd C:\Users\user\Desktop\Projects\DreamNest_Rental_Platform\server
npm install
copy .env.example .env
npm run seed
npm run dev
```

API runs at http://localhost:3001

## Terminal 2 — Frontend (project root)

```powershell
cd C:\Users\user\Desktop\Projects\DreamNest_Rental_Platform
npm install
npm start
```

App runs at http://localhost:3000 — wait for **Compiled successfully** before opening the browser.

## Demo login

| Email | Password |
|-------|----------|
| guest@dreamnest.com | password123 |
| host@dreamnest.com | password123 |
| admin@dreamnest.com | password123 |

## Quick checks

| Problem | Fix |
|--------|-----|
| `EADDRINUSE` port 3001 | Another API instance is already running. See below. |
| `Missing script: "dev"` in project root | Use `npm start` for React; run `npm run dev` inside `server/` for the API |
| Black / blank screen | Wait for compile; hard refresh (Ctrl+Shift+R) |
| Login does nothing | Start backend on port 3001 |

## Razorpay (live payments)

1. Get test keys from [dashboard.razorpay.com](https://dashboard.razorpay.com/app/keys)
2. Add to `server/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   PAYMENT_DEMO_MODE=false
   ```
3. Restart API — terminal should show `Razorpay: enabled (test mode)`

Full guide: **RAZORPAY_SETUP.md**

### Port 3001 already in use

```powershell
netstat -ano | findstr :3001
taskkill /PID <number_from_last_column> /F
```

Then run `npm run dev` again in `server/`. Or close the other terminal where the API was already started.
