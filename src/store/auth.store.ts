/**
 * auth.store.ts
 * Estado global de autenticación con Zustand.
 *
 * FIX: isAuthenticated ahora se deriva del token en tiempo real (getter)
 * en vez de ser un campo estático que podía quedar desincronizado.
 */
import { create } from "zustand";
import type { AuthUser } from "@/types";

interface AuthState {
  token: string | null;
  user:  AuthUser | null;
  login:  (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("tp_token"),
  user:  JSON.parse(localStorage.getItem("tp_user") || "null"),

  login: (token, user) => {
    localStorage.setItem("tp_token", token);
    localStorage.setItem("tp_user", JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("tp_token");
    localStorage.removeItem("tp_user");
    set({ token: null, user: null });
  },
}));

// Selector derivado — siempre lee el estado actual, nunca se desincroniza
export const useIsAuthenticated = () => !!useAuthStore((s) => s.token);
export const useCurrentUser     = () => useAuthStore((s) => s.user);
