import { create } from "zustand";

const getSavedTheme = () => {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem("sahayog_theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
};

export const useThemeStore = create((set) => ({
  theme: getSavedTheme(),
  initTheme: () => {
    const theme = getSavedTheme();
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      try {
        localStorage.setItem("sahayog_theme", nextTheme);
      } catch (e) {}
      return { theme: nextTheme };
    });
  },
  setTheme: (nextTheme) => {
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("sahayog_theme", nextTheme);
    } catch (e) {}
    set({ theme: nextTheme });
  },
}));
