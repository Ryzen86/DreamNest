/**
 * Consistent JSON API responses (keeps existing { message } / payload shapes).
 */

const sendError = (res, status, message, code) => {
  const body = { message };
  if (code) body.code = code;
  return res.status(status).json(body);
};

const sendSuccess = (res, status, payload) => {
  if (payload === undefined) {
    return res.status(status).end();
  }
  return res.status(status).json(payload);
};

/** Wrap async route handlers so thrown errors reach the global error middleware. */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { sendError, sendSuccess, asyncHandler };
