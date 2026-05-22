/**
 * API base URL for the DreamNest backend (Express server, default port 3001).
 * Set REACT_APP_API_URL in Vercel (or .env.local) to your deployed API, e.g.
 * https://your-api.onrender.com
 */
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001";

export const apiUrl = (path) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
};

/** Uploaded files are served from the API with paths like "public/uploads/..." */
export const assetUrl = (path) => {
  if (!path) return "";
  const cleaned = String(path).replace(/^\/?public\/?/, "").replace(/^\//, "");
  return `${API_BASE_URL}/${cleaned}`;
};

export const getAuthHeaders = (token, headers = {}) => ({
  ...headers,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});
