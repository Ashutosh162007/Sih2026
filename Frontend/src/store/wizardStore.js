import { create } from "zustand";

const empty = {
  title: "",
  category: "",
  description: "",
  evidence: [],
  district: "",
  block: "",
  landmark: "",
  lat: 18.5204,
  lng: 73.8567,
};

export const useWizardStore = create((set, get) => ({
  step: 0,
  data: { ...empty },
  setStep: (step) => set({ step }),
  next: () => set({ step: Math.min(get().step + 1, 4) }),
  back: () => set({ step: Math.max(get().step - 1, 0) }),
  update: (patch) => set({ data: { ...get().data, ...patch } }),
  reset: () => set({ step: 0, data: { ...empty } }),
}));
