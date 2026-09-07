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
    }
    // If backend is unreachable (e.g. ERR_CONNECTION_REFUSED or timeout), fallback seamlessly to mock adapter
    if (!err.response && err.config && !err.config._mockFallback) {
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
