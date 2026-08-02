const express = require("express");
const User = require("../models/User");
const {
  signToken,
  protect,
  formatUserResponse,
} = require("../middleware/auth");
const { profileUpload } = require("../middleware/upload");
const {
  trimBody,
  requireFields,
  validateEmailField,
  validatePasswordField,
} = require("../middleware/validate");
const { sendError, sendSuccess, asyncHandler } = require("../utils/apiResponse");
const { uploadImage } = require("../utils/s3Upload");

const router = express.Router();

router.post(
  "/register",
  profileUpload.single("profileImage"),
  trimBody(["firstName", "lastName", "email"]),
  requireFields(["firstName", "lastName", "email", "password"]),
  validateEmailField("email"),
  validatePasswordField("password", 6),
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return sendError(res, 400, "Email already registered", "EMAIL_TAKEN");
    }

    const profileImagePath = req.file
      ? await uploadImage(req.file, "profiles")
      : "public/assets/phucmai.png";

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      profileImagePath,
      role: "user",
    });

    return sendSuccess(res, 201, {
      message: "Registration successful",
      userId: user._id,
    });
  })
);

router.post(
  "/login",
  trimBody(["email"]),
  requireFields(["email", "password"]),
  validateEmailField("email"),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    const token = signToken(user._id);
    const fullUser = await formatUserResponse(user);

    return sendSuccess(res, 200, { user: fullUser, token });
  })
);

/** Refresh current user from a valid Bearer token (re-issues JWT). */
router.post(
  "/session",
  protect,
  asyncHandler(async (req, res) => {
    const fullUser = await formatUserResponse(req.user);
    return sendSuccess(res, 200, {
      user: fullUser,
      token: signToken(req.user._id),
    });
  })
);

module.exports = router;
