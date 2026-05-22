# DreamNest deployment guide

This repository is the **React frontend only**. Login, listings, bookings, and images from uploads all require a separate **Node/Express API** (usually on port `3001` in tutorials).

## Why nothing worked on Vercel

Vercel only hosts the static React build. The app was calling `http://localhost:3001`, which points at **your own computer**, not Vercel. Visitors on your live URL have no API there, so login and every feature fail.

## What you need

1. **Frontend** (this repo) → Vercel  
2. **Backend** (Express + MongoDB from your course/tutorial) → Render, Railway, Fly.io, etc.  
3. **Environment variable** on Vercel linking them together  

## Vercel setup (frontend)

1. Deploy this repo on Vercel (framework: Create React App, build: `npm run build`, output: `build`).
2. In Vercel → Project → **Settings** → **Environment Variables**, add:

   | Name | Value |
   |------|--------|
   | `REACT_APP_API_URL` | Your live API URL, e.g. `https://dreamnest-api.onrender.com` (no trailing slash) |

3. **Redeploy** after saving the variable (required for CRA env vars).

`vercel.json` is included for React Router (refresh on `/login` etc.).

## Local development

**Terminal 1 – API** (your backend project folder):

```bash
npm install
npm run dev
```

**Terminal 2 – frontend** (this folder):

```bash
npm install
npm start
```

With no `.env`, the app uses `http://localhost:3001` by default.

Optional `.env.local`:

```
REACT_APP_API_URL=http://localhost:3001
```

## Backend CORS

Your API must allow your Vercel domain, for example:

```javascript
app.use(cors({
  origin: ["http://localhost:3000", "https://your-app.vercel.app"],
  credentials: true,
}));
```

Redeploy the API after changing CORS.

## Checklist

- [ ] Backend deployed and reachable (open `https://your-api/...` in browser or Postman)
- [ ] `REACT_APP_API_URL` set on Vercel and project redeployed
- [ ] CORS includes your Vercel URL
- [ ] MongoDB connection string set on the API host (not in this frontend repo)

Without a deployed backend, the login page will show an error explaining that the API cannot be reached.
