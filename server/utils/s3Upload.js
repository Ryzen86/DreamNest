const path = require("path");
const crypto = require("crypto");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const getBucket = () => {
  const bucket = process.env.AWS_BUCKET_NAME;
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME is not configured");
  }
  return bucket;
};

const getRegion = () => process.env.AWS_REGION || "us-east-1";

const publicUrlForKey = (key) => {
  const bucket = getBucket();
  const region = getRegion();
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const buildObjectKey = (folder, originalname) => {
  const ext = path.extname(originalname || "").toLowerCase();
  const safeExt = ALLOWED_EXT.has(ext) ? ext : ".jpg";
  const unique = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
  const prefix = String(folder || "uploads").replace(/^\/+|\/+$/g, "");
  return `${prefix}/${unique}${safeExt}`;
};

const keyFromUrlOrKey = (urlOrKey) => {
  if (!urlOrKey) return null;
  const value = String(urlOrKey);
  if (!/^https?:\/\//i.test(value)) return value.replace(/^\//, "");

  try {
    const { pathname } = new URL(value);
    return decodeURIComponent(pathname.replace(/^\//, ""));
  } catch {
    return null;
  }
};

/**
 * Upload a single Multer memory-storage file to S3.
 * @param {Express.Multer.File} file
 * @param {string} folder - e.g. "profiles" or "listings"
 * @returns {Promise<string>} Public S3 object URL
 */
const uploadImage = async (file, folder = "uploads") => {
  if (!file?.buffer) {
    throw new Error("No image file provided for upload");
  }

  const Key = buildObjectKey(folder, file.originalname);
  await s3.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key,
      Body: file.buffer,
      ContentType: file.mimetype || "application/octet-stream",
    })
  );

  return publicUrlForKey(Key);
};

/**
 * Upload multiple Multer memory-storage files to S3.
 * @param {Express.Multer.File[]} files
 * @param {string} folder
 * @returns {Promise<string[]>} Public S3 object URLs
 */
const uploadImages = async (files, folder = "uploads") => {
  const list = Array.isArray(files) ? files : [];
  return Promise.all(list.map((file) => uploadImage(file, folder)));
};

/**
 * Delete an image from S3 by public URL or object key.
 * @param {string} urlOrKey
 * @returns {Promise<boolean>}
 */
const deleteImage = async (urlOrKey) => {
  const Key = keyFromUrlOrKey(urlOrKey);
  if (!Key) return false;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key,
    })
  );
  return true;
};

module.exports = {
  uploadImage,
  uploadImages,
  deleteImage,
};
