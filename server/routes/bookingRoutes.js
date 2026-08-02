const express = require("express");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const { protect } = require("../middleware/auth");
const { computeTotalPrice } = require("../utils/bookingHelpers");
const {
  requireFields,
  validateObjectIdBody,
} = require("../middleware/validate");
const { sendError, sendSuccess, asyncHandler } = require("../utils/apiResponse");

const router = express.Router();

/**
 * Creates a pending booking for the authenticated user.
 * Confirmed/paid bookings should go through /payments/verify.
 */
router.post(
  "/create",
  protect,
  requireFields(["listingId", "startDate", "endDate"]),
  validateObjectIdBody("listingId"),
  asyncHandler(async (req, res) => {
    const { listingId, startDate, endDate } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return sendError(res, 404, "Listing not found", "NOT_FOUND");
    }

    if (String(listing.creator) === String(req.user._id)) {
      return sendError(
        res,
        400,
        "You cannot book your own listing",
        "VALIDATION_ERROR"
      );
    }

    const priced = computeTotalPrice(listing.price, startDate, endDate);
    if (!priced) {
      return sendError(
        res,
        400,
        "Invalid dates. Please select at least one night.",
        "VALIDATION_ERROR"
      );
    }

    const booking = await Booking.create({
      customerId: req.user._id,
      listingId,
      hostId: listing.creator,
      startDate: String(startDate),
      endDate: String(endDate),
      totalPrice: priced.totalPrice,
      currency: "INR",
      paymentStatus: "pending",
      paymentMethod: "manual",
    });

    return sendSuccess(res, 201, booking);
  })
);

module.exports = router;
