import { create } from "zustand";
import axiosClient from "../api/axiosClient";
import { ROLES } from "../lib/constants";

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("sahayog_user") || localStorage.getItem("cp_user") || "null"),
  token: localStorage.getItem("sahayog_token") || localStorage.getItem("cp_token"),
  loading: false,
  error: null,

  setSession: (token, user) => {
    localStorage.setItem("sahayog_token", token);
    localStorage.setItem("sahayog_user", JSON.stringify(user));
    localStorage.setItem("cp_token", token);
    localStorage.setItem("cp_user", JSON.stringify(user));
    set({ token, user, error: null });
  },

  clearSession: () => {
    localStorage.removeItem("sahayog_token");
    localStorage.removeItem("sahayog_user");
    localStorage.removeItem("cp_token");
    localStorage.removeItem("cp_user");
    set({ token: null, user: null });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosClient.post("/api/auth/login", { email, password });
      if (data.requireOtp) {
        return data;
      }
      get().setSession(data.token, data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  googleLogin: async (credentialOrPayload, legacyRole) => {
    set({ loading: true, error: null });
    try {
      const payload =
        typeof credentialOrPayload === "object" && credentialOrPayload !== null && !credentialOrPayload.credential
          ? credentialOrPayload
          : typeof credentialOrPayload === "object" && credentialOrPayload.credential
          ? credentialOrPayload
          : { credential: credentialOrPayload, role: legacyRole };

      const { data } = await axiosClient.post("/api/auth/google", payload);
      get().setSession(data.token, data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Google authentication failed";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosClient.post("/api/auth/register", payload);
      // Registration now requires OTP verification before setting user session
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosClient.post("/api/auth/verify-otp", { email, otp });
      if (data.token && data.user) {
        get().setSession(data.token, data.user);
      }
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "OTP verification failed";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  resendOtp: async (email) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosClient.post("/api/auth/resend-otp", { email });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to resend OTP";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchProfile: async () => {
    if (!get().token) return null;
    try {
      const { data } = await axiosClient.get("/api/users/profile");
      localStorage.setItem("sahayog_user", JSON.stringify(data));
      set({ user: data });
      return data;
    } catch {
      return get().user;
    }
  },

  logout: () => get().clearSession(),

  homeForRole: (user = get().user) => {
    if (!user) return "/login";
    if (user.status === "pending") return "/signup/pending";
    switch (user.role) {
      case ROLES.UNIVERSITY:
        return "/university/dashboard";
      case ROLES.INDUSTRY:
        return "/industry/queue";
      case ROLES.ADMIN:
        return "/admin/dashboard";
      default:
        return "/my-issues";
    }
  },
}));
