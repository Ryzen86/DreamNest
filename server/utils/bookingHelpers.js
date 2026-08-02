/**
 * Shared booking date/price helpers (no external deps).
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseStayDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

/** Number of nights between check-in and check-out (exclusive end). */
const getNightCount = (startDate, endDate) => {
  const start = parseStayDate(startDate);
  const end = parseStayDate(endDate);
  if (!start || !end) return 0;
  const nights = Math.round((end - start) / MS_PER_DAY);
  return nights > 0 ? nights : 0;
};

const computeTotalPrice = (pricePerNight, startDate, endDate) => {
  const nights = getNightCount(startDate, endDate);
  const rate = Math.round(Number(pricePerNight));
  if (!nights || !rate || rate <= 0) return null;
  return {
    nights,
    pricePerNight: rate,
    totalPrice: rate * nights,
  };
};

const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(String(id || ""));

module.exports = {
  escapeRegex,
  parseStayDate,
  getNightCount,
  computeTotalPrice,
  isValidObjectId,
};
