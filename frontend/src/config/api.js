const configuredBaseUrl = (import.meta.env.VITE_BASE_URL || "").trim();

// Remove trailing slash so route joins remain stable.
export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, "");
