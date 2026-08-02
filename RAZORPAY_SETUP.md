# Razorpay payment gateway setup

DreamNest uses **Razorpay** for INR payments (UPI, cards, net banking, wallets).

## 1. Create a Razorpay account

1. Sign up at [https://dashboard.razorpay.com/signup](https://dashboard.razorpay.com/signup)
2. Complete KYC for live payments (test mode works immediately)

## 2. Get API keys

1. Open [Razorpay Dashboard → Settings → API Keys](https://dashboard.razorpay.com/app/keys)
2. Generate **Test Mode** keys for development
3. Copy **Key ID** (`rzp_test_...`) and **Key Secret**

## 3. Configure the server

Edit `server/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
PAYMENT_DEMO_MODE=false
```

Restart the API:

```powershell
cd server
npm run dev
```

You should see: `Razorpay: enabled (test/live key detected)`

## 4. Test a payment

1. Log in as `guest@dreamnest.com` / `password123`
2. Open any listing → select dates → **Proceed to Payment**
3. Click **Pay with Razorpay**
4. Use Razorpay **test card**:
   - Card: `4111 1111 1111 1111`
   - Expiry: any future date
   - CVV: any 3 digits
   - OTP: `1234` (test mode)

Or use **Test UPI ID**: `success@razorpay`

## 5. Demo mode (no keys)

If `RAZORPAY_KEY_ID` is empty, the app uses a **demo gateway** for local testing without a Razorpay account.

## 6. Production deployment

| Service | Variable |
|---------|----------|
| API host (Render/Railway) | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `PAYMENT_DEMO_MODE=false` |
| Vercel (frontend) | `REACT_APP_API_URL` = your API URL |

Use **Live Mode** keys from Razorpay dashboard for production.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/payments/config` | Returns `{ keyId, demoMode, currency }` |
| POST | `/payments/create-order` | Creates Razorpay order |
| POST | `/payments/verify` | Verifies signature & creates booking |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Still shows demo gateway | Add keys to `server/.env`, set `PAYMENT_DEMO_MODE=false`, restart API |
| Customer not found | Log out and log in again (especially after `npm run seed`) |
| Payment verification failed | Key secret mismatch — regenerate keys in dashboard |
