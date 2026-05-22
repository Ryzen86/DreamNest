const express = require("express");
const User = require("../models/User");
const { signToken, formatUserResponse } = require("../middleware/auth");
const { profileUpload } = require("../middleware/upload");

const router = express.Router();

router.post("/register", profileUpload.single("profileImage"), async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const profileImagePath = req.file
      ? `public/uploads/profiles/${req.file.filename}`
      : "public/assets/phucmai.png";

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      profileImagePath,
      role: "user",
    });

    res.status(201).json({ message: "Registration successful", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);
    const fullUser = await formatUserResponse(user);

    res.json({ user: fullUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
