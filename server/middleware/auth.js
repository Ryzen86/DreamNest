const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError } = require("../utils/apiResponse");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return "dreamnest_dev_secret";
};

const signToken = (userId) =>
  jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: "7d",
  });

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.slice(7).trim();
    }

    if (!token) {
      return sendError(res, 401, "Not authorized", "UNAUTHORIZED");
    }

    const decoded = jwt.verify(token, getJwtSecret());
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return sendError(
        res,
        401,
        "Session expired. Please log in again.",
        "SESSION_STALE"
      );
    }
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return sendError(res, 401, "Not authorized", "UNAUTHORIZED");
    }
    if (err.message === "JWT_SECRET is required in production") {
      console.error(err.message);
      return sendError(res, 500, "Server configuration error", "SERVER_ERROR");
    }
    return sendError(res, 401, "Not authorized", "UNAUTHORIZED");
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return sendError(res, 403, "Insufficient permissions", "FORBIDDEN");
  }
  next();
};

/** Ensure URL :userId matches the authenticated user (admins allowed). */
const requireSelfOrAdmin = (req, res, next) => {
  const targetId = String(req.params.userId || "");
  const selfId = String(req.user._id);
  if (targetId !== selfId && req.user.role !== "admin") {
    return sendError(res, 403, "Insufficient permissions", "FORBIDDEN");
  }
  next();
};

const formatUserResponse = async (user) => {
  const populated = await User.findById(user._id)
    .select("-password")
    .populate({
      path: "wishList",
      populate: { path: "creator", select: "-password" },
    });

  return populated;
};

module.exports = {
  signToken,
  protect,
  requireRole,
  requireSelfOrAdmin,
  formatUserResponse,
  getJwtSecret,
};
