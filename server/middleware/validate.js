const { sendError } = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/bookingHelpers");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const trimBody = (fields = []) => (req, _res, next) => {
  if (!req.body || typeof req.body !== "object") return next();
  fields.forEach((field) => {
    if (typeof req.body[field] === "string") {
      req.body[field] = req.body[field].trim();
    }
  });
  next();
};

const requireFields = (fields = []) => (req, res, next) => {
  const missing = fields.filter((field) => {
    const value = req.body?.[field];
    return value === undefined || value === null || String(value).trim() === "";
  });
  if (missing.length) {
    return sendError(
      res,
      400,
      `Missing required fields: ${missing.join(", ")}`,
      "VALIDATION_ERROR"
    );
  }
  next();
};

const validateEmailField = (field = "email") => (req, res, next) => {
  const email = String(req.body?.[field] || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return sendError(res, 400, "Invalid email address", "VALIDATION_ERROR");
  }
  req.body[field] = email;
  next();
};

const validatePasswordField =
  (field = "password", minLength = 6) =>
  (req, res, next) => {
    const password = String(req.body?.[field] || "");
    if (password.length < minLength) {
      return sendError(
        res,
        400,
        `Password must be at least ${minLength} characters`,
        "VALIDATION_ERROR"
      );
    }
    next();
  };

const validateObjectIdParam = (paramName) => (req, res, next) => {
  if (!isValidObjectId(req.params[paramName])) {
    return sendError(res, 400, `Invalid ${paramName}`, "VALIDATION_ERROR");
  }
  next();
};

const validateObjectIdBody = (field) => (req, res, next) => {
  if (!isValidObjectId(req.body?.[field])) {
    return sendError(res, 400, `Invalid ${field}`, "VALIDATION_ERROR");
  }
  next();
};

module.exports = {
  EMAIL_RE,
  trimBody,
  requireFields,
  validateEmailField,
  validatePasswordField,
  validateObjectIdParam,
  validateObjectIdBody,
};
