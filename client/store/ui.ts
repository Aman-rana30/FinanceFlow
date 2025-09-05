import { create } from "zustand";

interface UIState {
  masked: boolean; // masks sensitive amounts (e.g., show ••••)
  panic: boolean; // blur all numbers immediately
  commandOpen: boolean;
  setMasked: (v: boolean) => void;
  toggleMasked: () => void;
  setPanic: (v: boolean) => void;
  togglePanic: () => void;
  setCommandOpen: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  masked: false,
  panic: false,
  commandOpen: false,
  setMasked: (v) => set({ masked: v }),
  toggleMasked: () => set((s) => ({ masked: !s.masked })),
  setPanic: (v) => set({ panic: v }),
  togglePanic: () => set((s) => ({ panic: !s.panic })),
  setCommandOpen: (v) => set({ commandOpen: v }),
}));
