const express = require("express");
const crypto = require("crypto");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const { protect } = require("../middleware/auth");
const {
  computeTotalPrice,
  isValidObjectId,
} = require("../utils/bookingHelpers");
const { requireFields } = require("../middleware/validate");
const { sendError, sendSuccess, asyncHandler } = require("../utils/apiResponse");

const router = express.Router();

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  // eslint-disable-next-line global-require
  const Razorpay = require("razorpay");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

/** Demo only when Razorpay keys are absent (or explicitly allowed in production). */
const isDemoPayments = () => {
  const hasKeys =
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
  if (hasKeys) return false;
  if (process.env.NODE_ENV === "production") {
    return process.env.PAYMENT_DEMO_MODE === "true";
  }
  return true;
};

const getPaymentMode = () => {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return process.env.RAZORPAY_KEY_ID.startsWith("rzp_live_") ? "live" : "test";
  }
  return "demo";
};

const resolveListingAndPrice = async (listingId, startDate, endDate, customerId) => {
  if (!isValidObjectId(listingId)) {
    return {
      error: { status: 400, message: "Invalid listing id", code: "VALIDATION_ERROR" },
    };
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    return { error: { status: 404, message: "Listing not found", code: "NOT_FOUND" } };
  }

  if (String(listing.creator) === String(customerId)) {
    return {
      error: {
        status: 400,
        message: "You cannot book your own listing",
        code: "VALIDATION_ERROR",
      },
    };
  }

  const priced = computeTotalPrice(listing.price, startDate, endDate);
  if (!priced) {
    return {
      error: {
        status: 400,
        message: "Invalid dates. Please select at least one night.",
        code: "VALIDATION_ERROR",
      },
    };
  }

  return { listing, priced };
};

router.get("/config", (_req, res) => {
  const mode = getPaymentMode();
  return sendSuccess(res, 200, {
    currency: "INR",
    keyId: isDemoPayments() ? null : process.env.RAZORPAY_KEY_ID || null,
    demoMode: isDemoPayments(),
    provider: isDemoPayments() ? "demo" : "razorpay",
    mode,
  });
});

router.post(
  "/create-order",
  protect,
  requireFields(["listingId", "startDate", "endDate"]),
  asyncHandler(async (req, res) => {
    const { listingId, startDate, endDate, listingTitle } = req.body;

    const resolved = await resolveListingAndPrice(
      listingId,
      startDate,
      endDate,
      req.user._id
    );
    if (resolved.error) {
      return sendError(
        res,
        resolved.error.status,
        resolved.error.message,
        resolved.error.code
      );
    }

    const { listing, priced } = resolved;
    const amount = priced.totalPrice;

    const bookingDetails = {
      customerId: String(req.user._id),
      customerEmail: req.user.email,
      listingId: String(listing._id),
      hostId: String(listing.creator),
      startDate: String(startDate),
      endDate: String(endDate),
      totalPrice: amount,
      listingTitle: listingTitle || listing.title,
      nightCount: priced.nights,
      pricePerNight: priced.pricePerNight,
    };

    if (isDemoPayments()) {
      return sendSuccess(res, 200, {
        demoMode: true,
        currency: "INR",
        amount,
        amountInPaise: amount * 100,
        bookingDetails,
      });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return sendError(
        res,
        503,
        "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env.",
        "PAYMENT_UNAVAILABLE"
      );
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `dreamnest_${Date.now()}`,
      notes: {
        customerId: String(req.user._id),
        listingId: String(listing._id),
        hostId: String(listing.creator),
        startDate: String(startDate),
        endDate: String(endDate),
        totalPrice: String(amount),
      },
    });

    return sendSuccess(res, 200, {
      demoMode: false,
      provider: "razorpay",
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount,
      amountInPaise: order.amount,
      currency: order.currency,
      bookingDetails,
    });
  })
);

router.post(
  "/verify",
  protect,
  asyncHandler(async (req, res) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      demoMode,
      bookingDetails,
    } = req.body;

    if (!bookingDetails) {
      return sendError(res, 400, "Booking details required", "VALIDATION_ERROR");
    }

    const { listingId, startDate, endDate } = bookingDetails;

    const resolved = await resolveListingAndPrice(
      listingId,
      startDate,
      endDate,
      req.user._id
    );
    if (resolved.error) {
      return sendError(
        res,
        resolved.error.status,
        resolved.error.message,
        resolved.error.code
      );
    }

    const { listing, priced } = resolved;
    const totalPrice = priced.totalPrice;

    let paymentStatus = "paid";
    let paymentId = razorpay_payment_id;
    let orderId = razorpay_order_id;
    let paymentMethod = "razorpay";

    if (demoMode) {
      if (!isDemoPayments()) {
        return sendError(res, 400, "Demo payments are disabled", "DEMO_DISABLED");
      }
      paymentStatus = "demo";
      paymentId = `demo_pay_${Date.now()}`;
      orderId = `demo_order_${Date.now()}`;
      paymentMethod = "demo_gateway";
    } else {
      const razorpay = getRazorpay();
      if (!razorpay) {
        return sendError(res, 503, "Razorpay is not configured", "PAYMENT_UNAVAILABLE");
      }
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return sendError(
          res,
          400,
          "Missing Razorpay payment details",
          "VALIDATION_ERROR"
        );
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const expected = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expected !== razorpay_signature) {
        return sendError(res, 400, "Payment verification failed", "PAYMENT_INVALID");
      }

      try {
        const order = await razorpay.orders.fetch(razorpay_order_id);
        if (Number(order.amount) !== totalPrice * 100) {
          return sendError(res, 400, "Payment amount mismatch", "PAYMENT_INVALID");
        }
        if (
          order.notes?.customerId &&
          String(order.notes.customerId) !== String(req.user._id)
        ) {
          return sendError(res, 400, "Payment customer mismatch", "PAYMENT_INVALID");
        }
        if (
          order.notes?.listingId &&
          String(order.notes.listingId) !== String(listing._id)
        ) {
          return sendError(res, 400, "Payment listing mismatch", "PAYMENT_INVALID");
        }
      } catch (fetchErr) {
        console.error(fetchErr);
        return sendError(
          res,
          400,
          "Could not verify payment order",
          "PAYMENT_INVALID"
        );
      }
    }

    const booking = await Booking.create({
      customerId: req.user._id,
      listingId: listing._id,
      hostId: listing.creator,
      startDate: String(startDate),
      endDate: String(endDate),
      totalPrice,
      currency: "INR",
      paymentStatus,
      paymentId,
      orderId,
      paymentMethod,
    });

    const populated = await Booking.findById(booking._id)
      .populate({
        path: "listingId",
        populate: { path: "creator", select: "-password" },
      })
      .populate({ path: "hostId", select: "-password" });

    return sendSuccess(res, 201, {
      message: "Payment successful",
      booking: populated,
    });
  })
);

module.exports = router;
