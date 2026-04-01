import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      // Login action
      actionLogin: async (formData) => {
        const res = await api.post("/user/login.php", formData);
        set({
          token: res.data.token || null,
          user: res.data.user || null,
        });
        return res.data;
      },

      // Logout action
      actionLogout: () => {
        set({ token: null, user: null });
      },

      // ตรวจสอบ token กับ auth.php
      checkAuth: async () => {
        const token = get().token;
        if (!token) {
          set({ user: null });
          return null;
        }

        try {
          const res = await api.post(
            "/auth/auth.php",
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (res.data.valid) {
            set({ user: res.data.user });
            return res.data.user;
          } else {
            set({ token: null, user: null });
            return null;
          }
        } catch (err) {
          set({ token: null, user: null });
          return null;
        }
      },
    }),
    {
      name: "novel-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);


export default useAuthStore;
