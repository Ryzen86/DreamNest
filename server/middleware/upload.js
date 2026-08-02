const path = require("path");
const multer = require("multer");

const ALLOWED_MIME = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const imageFileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mimeOk = Boolean(ALLOWED_MIME[file.mimetype]);
  const extOk = !ext || ALLOWED_EXT.has(ext);

  if (mimeOk && extOk) {
    cb(null, true);
    return;
  }
  cb(new Error("Only image files (JPEG, PNG, WebP, GIF) are allowed"));
};

const storage = multer.memoryStorage();

const profileUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: imageFileFilter,
});

const listingUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: imageFileFilter,
});
module.exports = { profileUpload, listingUpload };
