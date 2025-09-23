import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      login: (token, user) => {
        // Normalizar el ID para usar siempre _id
        const normalizedUser = { ...user, _id: user._id || user.id };
        set({ token, user: normalizedUser });
      },

      logout: () => {
        set({ token: null, user: null });
      },

      // Agrega esta función para actualizar solo el usuario
      setUser: (updatedUser) => {
        const normalizedUser = { ...updatedUser, _id: updatedUser._id || updatedUser.id };
        set({ user: normalizedUser });
      },

      // También puedes agregar una función para actualizar datos específicos
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          const normalizedUser = { ...updatedUser, _id: updatedUser._id || updatedUser.id };
          set({ user: normalizedUser });
        }
      },
    }),
    {
      name: 'auth-storage',
      serialize: (state) => JSON.stringify(state),
      deserialize: (str) => JSON.parse(str),
    }
  )
);

export default useAuthStore;