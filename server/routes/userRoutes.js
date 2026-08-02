const express = require("express");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const {
  formatUserResponse,
  protect,
  requireSelfOrAdmin,
} = require("../middleware/auth");
const { validateObjectIdParam } = require("../middleware/validate");
const { sendError, sendSuccess, asyncHandler } = require("../utils/apiResponse");

const router = express.Router();

router.get(
  "/:userId/properties",
  validateObjectIdParam("userId"),
  asyncHandler(async (req, res) => {
    const listings = await Listing.find({ creator: req.params.userId }).populate({
      path: "creator",
      select: "-password",
    });
    return sendSuccess(res, 200, listings);
  })
);

router.get(
  "/:userId/trips",
  validateObjectIdParam("userId"),
  protect,
  requireSelfOrAdmin,
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ customerId: req.params.userId })
      .populate({
        path: "listingId",
        populate: { path: "creator", select: "-password" },
      })
      .populate({ path: "hostId", select: "-password" })
      .sort({ createdAt: -1 });
    return sendSuccess(res, 200, bookings);
  })
);

router.get(
  "/:userId/reservations",
  validateObjectIdParam("userId"),
  protect,
  requireSelfOrAdmin,
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ hostId: req.params.userId })
      .populate({
        path: "listingId",
        populate: { path: "creator", select: "-password" },
      })
      .populate({ path: "hostId", select: "-password" })
      .sort({ createdAt: -1 });
    return sendSuccess(res, 200, bookings);
  })
);

router.patch(
  "/:userId/:listingId",
  validateObjectIdParam("userId"),
  validateObjectIdParam("listingId"),
  protect,
  requireSelfOrAdmin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, "User not found", "NOT_FOUND");
    }

    const listingId = req.params.listingId;
    const index = user.wishList.findIndex((id) => id.toString() === listingId);

    if (index >= 0) {
      user.wishList.splice(index, 1);
    } else {
      const listing = await Listing.findById(listingId).select("creator");
      if (!listing) {
        return sendError(res, 404, "Listing not found", "NOT_FOUND");
      }
      if (String(listing.creator) === String(req.user._id)) {
        return sendError(
          res,
          400,
          "Cannot wishlist your own listing",
          "VALIDATION_ERROR"
        );
      }
      user.wishList.push(listingId);
    }

    await user.save();
    const updated = await formatUserResponse(user);
    return sendSuccess(res, 200, { wishList: updated.wishList });
  })
);

module.exports = router;
