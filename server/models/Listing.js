const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String, required: true },
    type: { type: String, required: true },
    streetAddress: String,
    aptSuite: String,
    city: { type: String, required: true },
    province: { type: String, required: true },
    country: { type: String, required: true },
    guestCount: { type: Number, default: 1 },
    bedroomCount: { type: Number, default: 1 },
    bedCount: { type: Number, default: 1 },
    bathroomCount: { type: Number, default: 1 },
    amenities: { type: [String], default: [] },
    title: { type: String, required: true },
    description: { type: String, required: true },
    highlight: String,
    highlightDesc: String,
    price: { type: Number, required: true },
    listingPhotoPaths: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);
