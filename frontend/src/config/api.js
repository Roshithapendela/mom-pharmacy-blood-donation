const fallbackBaseUrl = "https://mom-pharmacy-blood-donation.onrender.com";
const configuredBaseUrl = (
  import.meta.env.VITE_BASE_URL || fallbackBaseUrl
).trim();

// Remove trailing slash so route joins remain stable.
export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, "");
