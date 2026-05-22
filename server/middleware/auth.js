const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || "dreamnest_dev_secret", {
    expiresIn: "7d",
  });

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dreamnest_dev_secret"
    );
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};

const formatUserResponse = async (user) => {
  const populated = await User.findById(user._id)
    .select("-password")
    .populate({ path: "wishList", populate: { path: "creator", select: "-password" } });

  return populated;
};

module.exports = { signToken, protect, requireRole, formatUserResponse };
