const express = require("express");
const Listing = require("../models/Listing");
const User = require("../models/User");
const { listingUpload } = require("../middleware/upload");
const { protect } = require("../middleware/auth");
const { escapeRegex, isValidObjectId } = require("../utils/bookingHelpers");
const { sendError, sendSuccess, asyncHandler } = require("../utils/apiResponse");
const { uploadImages } = require("../utils/s3Upload");

const router = express.Router();

const populateListing = { path: "creator", select: "-password" };

const parseAmenities = (raw) => {
  if (Array.isArray(raw)) return raw.filter(Boolean).map(String).slice(0, 50);
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(Boolean).map(String).slice(0, 50)
      : [];
  } catch {
    return raw
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean)
      .slice(0, 50);
  }
};

const clampCount = (value, fallback = 1, max = 50) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), max);
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.category && req.query.category !== "All") {
      filter.category = String(req.query.category).slice(0, 100);
    }
    const listings = await Listing.find(filter)
      .populate(populateListing)
      .sort({ createdAt: -1 });
    return sendSuccess(res, 200, listings);
  })
);

router.get(
  "/search/:search",
  asyncHandler(async (req, res) => {
    const term = escapeRegex(String(req.params.search || "").slice(0, 100));
    if (!term.trim()) {
      return sendSuccess(res, 200, []);
    }
    const regex = new RegExp(term, "i");
    const listings = await Listing.find({
      $or: [
        { title: regex },
        { description: regex },
        { city: regex },
        { province: regex },
        { country: regex },
        { category: regex },
        { type: regex },
      ],
    })
      .populate(populateListing)
      .sort({ createdAt: -1 });
    return sendSuccess(res, 200, listings);
  })
);

router.post(
  "/create",
  protect,
  listingUpload.array("listingPhotos", 10),
  asyncHandler(async (req, res) => {
    const body = req.body;
    const creatorId = req.user._id;

    const missing = [];
    if (!body.category || body.category === "All") missing.push("category");
    if (!body.type) missing.push("property type");
    if (!String(body.city || "").trim()) missing.push("city");
    if (!String(body.province || "").trim()) missing.push("province");
    if (!String(body.country || "").trim()) missing.push("country");
    if (!String(body.title || "").trim()) missing.push("title");
    if (!String(body.description || "").trim()) missing.push("description");
    if (!body.price || Number(body.price) <= 0) {
      missing.push("price (must be greater than 0)");
    }

    const files = req.files || [];
    if (files.length === 0) {
      missing.push("at least one photo");
    }

    if (missing.length) {
      return sendError(
        res,
        400,
        `Please complete: ${missing.join(", ")}`,
        "VALIDATION_ERROR"
      );
    }

    const listingPhotoPaths = await uploadImages(files, "listings");

    const listing = await Listing.create({
      creator: creatorId,
      category: String(body.category).trim().slice(0, 100),
      type: String(body.type).trim().slice(0, 100),
      streetAddress: String(body.streetAddress || "").trim().slice(0, 200),
      aptSuite: String(body.aptSuite || "").trim().slice(0, 100),
      city: String(body.city).trim().slice(0, 100),
      province: String(body.province).trim().slice(0, 100),
      country: String(body.country).trim().slice(0, 100),
      guestCount: clampCount(body.guestCount),
      bedroomCount: clampCount(body.bedroomCount),
      bedCount: clampCount(body.bedCount),
      bathroomCount: clampCount(body.bathroomCount),
      amenities: parseAmenities(body.amenities),
      title: String(body.title).trim().slice(0, 200),
      description: String(body.description).trim().slice(0, 5000),
      highlight: String(body.highlight || "").trim().slice(0, 200),
      highlightDesc: String(body.highlightDesc || "").trim().slice(0, 1000),
      price: Math.round(Number(body.price)),
      listingPhotoPaths,
    });

    if (req.user.role === "user") {
      await User.findByIdAndUpdate(creatorId, { role: "host" });
    }

    const populated = await Listing.findById(listing._id).populate(populateListing);
    return sendSuccess(res, 201, populated);
  })
);

router.get(
  "/:listingId",
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.listingId)) {
      return sendError(res, 404, "Listing not found", "NOT_FOUND");
    }

    const listing = await Listing.findById(req.params.listingId).populate(
      populateListing
    );
    if (!listing) {
      return sendError(res, 404, "Listing not found", "NOT_FOUND");
    }
    return sendSuccess(res, 200, listing);
  })
);

module.exports = router;
