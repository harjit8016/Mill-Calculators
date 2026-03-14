import { create } from 'zustand';

const useAppStore = create((set) => ({
  userId: null,
  user: null,
  setUser: (user) => set({ user, userId: user?.uid || null }),
}));

export default useAppStore;
