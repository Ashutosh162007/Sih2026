import axios from "axios";
import { handleMockRequest } from "./mockAdapter";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("cp_token");
  const publicPaths = ["/api/auth/login", "/api/auth/register"];
  const isPublic = publicPaths.some((p) => config.url?.includes(p));
  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("cp_token");
    }
    return Promise.reject(err);
  },
);

const useMock = import.meta.env.VITE_USE_MOCK !== "false";

if (useMock) {
  axiosClient.defaults.adapter = async (config) => handleMockRequest(config);
}

export default axiosClient;
