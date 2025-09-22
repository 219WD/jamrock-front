import { create } from 'zustand';

const useLoadingStore = create((set) => ({
  isLoading: false,
  loadingText: "Cargando...",
  setLoading: (loading) => set({ isLoading: loading }),
  setLoadingText: (text) => set({ loadingText: text }),
}));

export default useLoadingStore;