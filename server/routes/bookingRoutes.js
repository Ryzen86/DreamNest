const express = require("express");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { customerId, listingId, hostId, startDate, endDate, totalPrice } =
      req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const booking = await Booking.create({
      customerId,
      listingId,
      hostId: hostId || listing.creator,
      startDate,
      endDate,
      totalPrice,
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Booking failed" });
  }
});

module.exports = router;
