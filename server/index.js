require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const connectDB = require("./config/db");
const { getJwtSecret } = require("./middleware/auth");
const { sendError } = require("./utils/apiResponse");

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const PORT = process.env.PORT || 3002;
const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  try {
    getJwtSecret();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

const clientUrls = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

app.set("trust proxy", 1);

app.use(
  helmet({
    // Allow frontend (different origin) to load listing/profile images from this API
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, Postman, server-to-server)
      if (!origin || clientUrls.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later.", code: "RATE_LIMIT" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 30 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
    code: "RATE_LIMIT",
  },
});

app.use("/api", apiLimiter);
app.use("/auth", apiLimiter);
app.use("/properties", apiLimiter);
app.use("/users", apiLimiter);
app.use("/bookings", apiLimiter);
app.use("/payments", apiLimiter);

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "DreamNest API running" });
});

app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);
app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/users", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/payments", paymentRoutes);

app.use((req, res) => {
  sendError(res, 404, "Route not found", "NOT_FOUND");
});

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return sendError(
      res,
      status,
      err.code === "LIMIT_FILE_SIZE" ? "File too large" : "Invalid upload",
      "UPLOAD_ERROR"
    );
  }

  if (err.message && err.message.includes("Only image files")) {
    return sendError(res, 400, err.message, "UPLOAD_ERROR");
  }

  if (err.name === "ValidationError") {
    return sendError(res, 400, err.message, "VALIDATION_ERROR");
  }

  if (err.name === "CastError") {
    return sendError(res, 400, "Invalid id", "VALIDATION_ERROR");
  }

  return sendError(
    res,
    err.status || 500,
    isProd ? "Server error" : err.message || "Server error",
    "SERVER_ERROR"
  );
});

const start = async () => {
  await connectDB();
  const hasRazorpay =
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
  if (!hasRazorpay) {
    console.log(
      "Razorpay: demo mode (add RAZORPAY_KEY_ID to server/.env for live gateway)"
    );
  } else if (process.env.RAZORPAY_KEY_ID.startsWith("rzp_live_")) {
    console.log("Razorpay: enabled (live mode)");
  } else {
    console.log("Razorpay: enabled (test mode)");
  }
  const server = app.listen(PORT, () => {
    console.log(`DreamNest API listening on http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\nPort ${PORT} is already in use. Stop the other process, then run npm run dev again.\n` +
          `Windows: netstat -ano | findstr :${PORT}   then   taskkill /PID <pid> /F\n`
      );
      process.exit(1);
    }
    throw err;
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err.message || err);
  if (String(err.message || err).includes("ECONNREFUSED")) {
    console.error(
      "MongoDB is not reachable. Start it, then retry:\n" +
        '  "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe" --dbpath server\\data\\db --port 27017 --bind_ip 127.0.0.1\n' +
        "  or: Start-Service MongoDB (as Administrator)\n" +
        "Also ensure PORT in server/.env is free (default 3002; 3001 may be used by other Docker apps)."
    );
  }
  process.exit(1);
});
