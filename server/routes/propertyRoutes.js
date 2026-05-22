const express = require("express");
const Listing = require("../models/Listing");
const User = require("../models/User");
const { listingUpload } = require("../middleware/upload");

const router = express.Router();

const populateListing = { path: "creator", select: "-password" };

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }
    const listings = await Listing.find(filter)
      .populate(populateListing)
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
});

router.get("/search/:search", async (req, res) => {
  try {
    const term = req.params.search;
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
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
});

router.get("/:listingId", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId).populate(
      populateListing
    );
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch listing" });
  }
});

router.post(
  "/create",
  listingUpload.array("listingPhotos", 10),
  async (req, res) => {
    try {
      const body = req.body;
      const creatorId = body.creator;

      if (!creatorId) {
        return res.status(400).json({ message: "Creator is required" });
      }

      const creatorUser = await User.findById(creatorId);
      if (!creatorUser) {
        return res.status(404).json({ message: "Creator not found" });
      }

      let amenities = body.amenities;
      if (typeof amenities === "string") {
        try {
          amenities = JSON.parse(amenities);
        } catch {
          amenities = amenities.split(",").map((a) => a.trim());
        }
      }
      if (!Array.isArray(amenities)) amenities = [];

      const photoPaths = (req.files || []).map(
        (f) => `public/uploads/listings/${f.filename}`
      );

      if (photoPaths.length === 0) {
        return res.status(400).json({ message: "At least one photo is required" });
      }

      const listing = await Listing.create({
        creator: creatorId,
        category: body.category,
        type: body.type,
        streetAddress: body.streetAddress,
        aptSuite: body.aptSuite,
        city: body.city,
        province: body.province,
        country: body.country,
        guestCount: Number(body.guestCount) || 1,
        bedroomCount: Number(body.bedroomCount) || 1,
        bedCount: Number(body.bedCount) || 1,
        bathroomCount: Number(body.bathroomCount) || 1,
        amenities,
        title: body.title,
        description: body.description,
        highlight: body.highlight,
        highlightDesc: body.highlightDesc,
        price: Number(body.price) || 0,
        listingPhotoPaths: photoPaths,
      });

      if (creatorUser.role === "user") {
        creatorUser.role = "host";
        await creatorUser.save();
      }

      res.status(201).json(listing);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create listing" });
    }
  }
);

module.exports = router;
