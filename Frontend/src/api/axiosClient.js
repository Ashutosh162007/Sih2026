import axios from "axios";
import { handleMockRequest } from "./mockAdapter";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("sahayog_token") || localStorage.getItem("cp_token");
  const publicPaths = ["/api/auth/login", "/api/auth/register", "/api/issues/ai-preview"];
  const isPublic = publicPaths.some((p) => config.url?.includes(p));
  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("sahayog_token");
      localStorage.removeItem("cp_token");
      localStorage.removeItem("sahayog_user");
      localStorage.removeItem("cp_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    // Only fall back to the mock adapter when mock mode is explicitly enabled
    if (err.config && import.meta.env.VITE_USE_MOCK === "true" && !err.response && !err.config._mockFallback) {
      err.config._mockFallback = true;
      try {
        return await handleMockRequest(err.config);
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }
    return Promise.reject(err);
  }
);

const forceMock = import.meta.env.VITE_USE_MOCK === "true";
if (forceMock) {
  axiosClient.defaults.adapter = async (config) => handleMockRequest(config);
}

export default axiosClient;
