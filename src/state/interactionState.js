import { create } from "zustand";

export const useInteractionState = create((set) => ({
  mode: "explore",

  setMode: (mode) => set({ mode }),
}));