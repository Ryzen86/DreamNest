/**
 * API base URL for the DreamNest backend (Express server).
 * Default port 3002 avoids conflicts with other local apps that use 3001.
 * Set REACT_APP_API_URL in .env.local / Vercel to match server/.env PORT.
 */
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3002";

export const apiUrl = (path) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
};

/** Uploaded files are served from the API with paths like "public/uploads/..." */
export const assetUrl = (path) => {
  if (!path) return `${API_BASE_URL}/assets/phucmai.png`;
  const raw = String(path);
  if (/^https?:\/\//i.test(raw)) return raw;
  const cleaned = raw.replace(/^\/?public\/?/, "").replace(/^\//, "");
  return `${API_BASE_URL}/${cleaned}`;
};

export const getAuthHeaders = (token, headers = {}) => ({
  ...headers,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});
