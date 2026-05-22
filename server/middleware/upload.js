const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadsDir = path.join(__dirname, "..", "public", "uploads");
const profilesDir = path.join(uploadsDir, "profiles");
const listingsDir = path.join(uploadsDir, "listings");

[uploadsDir, profilesDir, listingsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = (folder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, folder),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });

const profileUpload = multer({
  storage: storage(profilesDir),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const listingUpload = multer({
  storage: storage(listingsDir),
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { profileUpload, listingUpload };
