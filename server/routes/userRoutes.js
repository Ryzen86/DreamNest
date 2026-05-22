const express = require("express");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const { formatUserResponse } = require("../middleware/auth");

const router = express.Router();

router.get("/:userId/properties", async (req, res) => {
  try {
    const listings = await Listing.find({ creator: req.params.userId }).populate({
      path: "creator",
      select: "-password",
    });
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
});

router.get("/:userId/trips", async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.params.userId })
      .populate({ path: "listingId", populate: { path: "creator", select: "-password" } })
      .populate({ path: "hostId", select: "-password" })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch trips" });
  }
});

router.get("/:userId/reservations", async (req, res) => {
  try {
    const bookings = await Booking.find({ hostId: req.params.userId })
      .populate({ path: "listingId", populate: { path: "creator", select: "-password" } })
      .populate({ path: "hostId", select: "-password" })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reservations" });
  }
});

router.patch("/:userId/:listingId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const listingId = req.params.listingId;
    const index = user.wishList.findIndex(
      (id) => id.toString() === listingId
    );

    if (index >= 0) {
      user.wishList.splice(index, 1);
    } else {
      user.wishList.push(listingId);
    }

    await user.save();
    const updated = await formatUserResponse(user);
    res.json({ wishList: updated.wishList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Wishlist update failed" });
  }
});

module.exports = router;
