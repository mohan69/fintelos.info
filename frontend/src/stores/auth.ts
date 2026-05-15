import { create } from "zustand";
import { api, type User } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, company?: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.auth.login({ email, password });
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("user", JSON.stringify(res.user));
      set({ user: res.user, token: res.access_token, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Login failed", isLoading: false });
      throw err;
    }
  },

  register: async (email, password, fullName, company) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.auth.register({ email, password, full_name: fullName, company });
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("user", JSON.stringify(res.user));
      set({ user: res.user, token: res.access_token, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Registration failed", isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  loadFromStorage: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        set({ user: JSON.parse(userStr), token });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  },
}));
