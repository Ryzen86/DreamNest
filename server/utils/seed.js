require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const connectDB = require("../config/db");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");

const copyAssets = () => {
  const src = path.join(__dirname, "..", "..", "public", "assets");
  const dest = path.join(__dirname, "..", "public", "assets");
  if (!fs.existsSync(src)) {
    console.warn("Client public/assets not found, skipping asset copy");
    return;
  }
  fs.cpSync(src, dest, { recursive: true });
  console.log("Copied static assets to server/public/assets");
};

const listing1Photos = [
  "public/assets/Listing1/1.jpg",
  "public/assets/Listing1/2.jpg",
  "public/assets/Listing1/3.jpeg",
  "public/assets/Listing1/4.jpg",
];

const listing2Photos = [
  "public/assets/Listing2/windmills_1.jpg",
  "public/assets/Listing2/windmills_2.jpg",
  "public/assets/Listing2/windmills_3.jpg",
  "public/assets/Listing2/windmills_4.jpg",
];

const seed = async () => {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "true") {
    console.error(
      "Refusing to seed in production. Set ALLOW_SEED=true if you really intend to wipe the database."
    );
    process.exit(1);
  }

  await connectDB();
  copyAssets();

  await Promise.all([
    Booking.deleteMany({}),
    Listing.deleteMany({}),
    User.deleteMany({}),
  ]);

  const host = await User.create({
    firstName: "John",
    lastName: "Host",
    email: "host@dreamnest.com",
    password: "password123",
    role: "host",
    profileImagePath: "public/assets/John Smiths.jpg",
  });

  const guest = await User.create({
    firstName: "Jane",
    lastName: "Guest",
    email: "guest@dreamnest.com",
    password: "password123",
    role: "user",
    profileImagePath: "public/assets/denny.jpeg",
  });

  const admin = await User.create({
    firstName: "Admin",
    lastName: "DreamNest",
    email: "admin@dreamnest.com",
    password: "password123",
    role: "admin",
    profileImagePath: "public/assets/phucmai.png",
  });

  const beachHouse = await Listing.create({
    creator: host._id,
    category: "Beachfront",
    type: "Entire home",
    streetAddress: "12 Ocean Drive",
    city: "Miami",
    province: "Florida",
    country: "USA",
    guestCount: 6,
    bedroomCount: 3,
    bedCount: 4,
    bathroomCount: 2,
    amenities: ["Wifi", "Kitchen", "Free parking", "Pool", "Air conditioning"],
    title: "Sunny Beachfront Villa",
    description:
      "Wake up to ocean views in this spacious beachfront villa with a private patio and modern kitchen.",
    highlight: "Private beach access",
    highlightDesc: "Steps from the sand with outdoor dining and sunset views.",
    price: 18500,
    listingPhotoPaths: listing1Photos,
  });

  const windmillCottage = await Listing.create({
    creator: host._id,
    category: "Windmills",
    type: "Entire home",
    streetAddress: "88 Country Lane",
    city: "Amsterdam",
    province: "North Holland",
    country: "Netherlands",
    guestCount: 4,
    bedroomCount: 2,
    bedCount: 3,
    bathroomCount: 1,
    amenities: ["Wifi", "Kitchen", "Heating", "Washer", "Dryer"],
    title: "Charming Windmill Cottage",
    description:
      "Stay in a cozy countryside cottage surrounded by iconic windmills and tulip fields.",
    highlight: "Countryside escape",
    highlightDesc: "Perfect for a peaceful retreat close to the city.",
    price: 13800,
    listingPhotoPaths: listing2Photos,
  });

  const poolVilla = await Listing.create({
    creator: admin._id,
    category: "Amazing Pools",
    type: "Villa",
    streetAddress: "500 Palm Court",
    city: "Palm Springs",
    province: "California",
    country: "USA",
    guestCount: 8,
    bedroomCount: 4,
    bedCount: 5,
    bathroomCount: 3,
    amenities: ["Wifi", "Pool", "Kitchen", "Air conditioning", "TV"],
    title: "Desert Pool Villa",
    description:
      "Luxury desert villa with infinity pool, mountain views, and open-plan living space.",
    highlight: "Resort-style pool",
    highlightDesc: "Heated pool, loungers, and outdoor kitchen for entertaining.",
    price: 25900,
    listingPhotoPaths: listing1Photos.slice(0, 3),
  });

  guest.wishList = [windmillCottage._id, beachHouse._id];
  await guest.save();

  await Booking.create({
    customerId: guest._id,
    hostId: host._id,
    listingId: beachHouse._id,
    startDate: new Date(Date.now() + 86400000 * 7).toDateString(),
    endDate: new Date(Date.now() + 86400000 * 10).toDateString(),
    totalPrice: 55500,
    currency: "INR",
    paymentStatus: "demo",
    paymentMethod: "seed",
    paymentId: "seed_pay_1",
    orderId: "seed_order_1",
  });

  console.log("\n--- Seed complete ---");
  console.log("Host:   host@dreamnest.com / password123");
  console.log("Guest:  guest@dreamnest.com / password123");
  console.log("Admin:  admin@dreamnest.com / password123");
  console.log(`Listings created: ${await Listing.countDocuments()}\n`);

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
