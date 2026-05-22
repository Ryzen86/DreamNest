require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

const clientUrls = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((u) => u.trim());

app.use(
  cors({
    origin: clientUrls,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "DreamNest API running" });
});

app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/users", userRoutes);
app.use("/bookings", bookingRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

const start = async () => {
  await connectDB();
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

start();
