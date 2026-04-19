import axios from "axios";

// In dev: Vite proxies /api/* → localhost:4000 (strips /api prefix)
// In prod (Vercel): VITE_API_URL is empty, routes go directly to same domain
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : ""),
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export default api;
