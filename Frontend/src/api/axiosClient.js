import axios from "axios";
import { handleMockRequest } from "./mockAdapter";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
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
    const status = err.response?.status;
    const token = localStorage.getItem("sahayog_token") || localStorage.getItem("cp_token") || "";
    const isMockToken = token.startsWith("mock-");

    // If backend is unreachable, or returns 404/500, or 401 on mock session: fallback seamlessly to mock adapter
    if (
      (!err.response || status === 404 || status === 500 || (status === 401 && isMockToken)) &&
      err.config &&
      !err.config._mockFallback
    ) {
      err.config._mockFallback = true;
      try {
        return await handleMockRequest(err.config);
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }

    if (err.response?.status === 401 && !isMockToken) {
      localStorage.removeItem("sahayog_token");
      localStorage.removeItem("cp_token");
    }
    return Promise.reject(err);
  }
);

const forceMock = import.meta.env.VITE_USE_MOCK === "true";
if (forceMock) {
  axiosClient.defaults.adapter = async (config) => handleMockRequest(config);
}

export default axiosClient;
