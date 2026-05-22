# DreamNest — MERN Rental & Booking Platform

Full-stack property rental platform: search listings, wishlists, bookings, and role-based access (user, host, admin).

## Stack

| Layer | Tech |
|-------|------|
| **M**ongoDB | Database |
| **E**xpress | REST API (`server/`) |
| **R**eact | UI (Create React App) |
| **N**ode.js | API runtime |

## Quick start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally (or MongoDB Atlas URI in `server/.env`)

### 1. Backend

```powershell
cd server
npm install
copy .env.example .env
npm run seed
npm run dev
```

API: http://localhost:3001

### 2. Frontend (new terminal)

```powershell
cd ..
npm install
npm start
```

App: http://localhost:3000

### Demo accounts (after seed)

| Email | Password | Role |
|-------|----------|------|
| host@dreamnest.com | password123 | host |
| guest@dreamnest.com | password123 | user |
| admin@dreamnest.com | password123 | admin |

## Features

- JWT authentication (register / login)
- Property listings with categories, search, and filters
- Photo uploads (profile + listing images)
- Wishlist
- Booking / trips (guest) and reservations (host)
- Roles: **user**, **host** (auto-assigned after first listing), **admin**

## Project structure

```
DreamNest_Rental_Platform/
├── server/          # Express API + MongoDB
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/seed.js
├── src/             # React client
└── public/assets/   # Static images (seeded to server)
```

## Production (Vercel + API host)

1. Deploy `server/` to Render, Railway, etc.
2. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` on the API host.
3. On Vercel, set `REACT_APP_API_URL` to your API URL and redeploy.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| `server/` | `npm run dev` | API with nodemon |
| `server/` | `npm run seed` | Reset DB + demo data |
| root | `npm start` | React dev server |
