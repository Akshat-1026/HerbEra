import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  // Never hang forever: if the backend (Render free tier) is cold/offline,
  // fail fast so the UI can render instead of being stuck on a white page.
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  try {
    const lang = localStorage.getItem("i18nextLng") || "en";
    config.headers["Accept-Language"] = lang;
  } catch { /* ignore */ }
  return config;
});

export default api;
