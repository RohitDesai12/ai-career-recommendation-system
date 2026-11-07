/**
 * Career Compass API Configuration
 * Central source of truth for backend API base URL and request handling.
 */

// Dynamically resolve base URL:
// 1. VITE_API_URL if configured in environment
// 2. Relative empty string if in production on same domain / behind proxy
// 3. Fallback to http://localhost:5000 for local development
export const API_BASE_URL: string = (() => {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return ""; // Relative path for same-origin or reverse-proxied production deployments
  }
  return "http://localhost:5000";
})();

/**
 * Returns a fully qualified or clean relative URL for an API endpoint
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (!API_BASE_URL) {
    return cleanEndpoint;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export default API_BASE_URL;

