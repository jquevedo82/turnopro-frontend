/**
 * auth.store.ts
 * Estado global de autenticación con Zustand.
 *
 * FIX: isAuthenticated ahora se deriva del token en tiempo real (getter)
 * en vez de ser un campo estático que podía quedar desincronizado.
 *
 * NUEVO: activeProfessionalId — contexto activo de la secretaria.
 * Cuando la secretaria selecciona "Trabajando como Dr. García", este campo
 * guarda el id del profesional activo. Todos los endpoints del panel secretaria
 * lo usan como parámetro. Se persiste en sessionStorage (se limpia al cerrar tab).
 */
import { create } from "zustand";
import type { AuthUser, SecretaryProfessional } from "@/types";

interface AuthState {
  token: string | null;
  user:  AuthUser | null;

  // Contexto activo para secretarias — null hasta que seleccionen un profesional
  activeProfessionalId: number | null;

  login:                (token: string, user: AuthUser) => void;
  logout:               () => void;
  setActiveProfessional:(id: number) => void;
}

function safeParseUser(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem("tp_user") || "null");
  } catch {
    localStorage.removeItem("tp_user");
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("tp_token"),
  user:  safeParseUser(),

  // Restaurar contexto activo de secretaria si venía de una sesión anterior
  activeProfessionalId: Number(sessionStorage.getItem("tp_active_prof")) || null,

  login: (token, user) => {
    localStorage.setItem("tp_token", token);
    localStorage.setItem("tp_user", JSON.stringify(user));
    set({ token, user, activeProfessionalId: null });
  },

  logout: () => {
    localStorage.removeItem("tp_token");
    localStorage.removeItem("tp_user");
    sessionStorage.removeItem("tp_active_prof");
    set({ token: null, user: null, activeProfessionalId: null });
  },

  setActiveProfessional: (id) => {
    sessionStorage.setItem("tp_active_prof", String(id));
    set({ activeProfessionalId: id });
  },
}));

// ── Selectores derivados ──────────────────────────────────────────────────────
export const useIsAuthenticated    = () => !!useAuthStore((s) => s.token);
export const useCurrentUser        = () => useAuthStore((s) => s.user);
export const useActiveProfessional = () => {
  const user                = useAuthStore((s) => s.user);
  const activeProfessionalId = useAuthStore((s) => s.activeProfessionalId);

  if (!user || user.role !== "secretary") return null;

  // Buscar los datos completos del profesional activo dentro de la lista del usuario
  return user.professionals?.find((p: SecretaryProfessional) => p.id === activeProfessionalId) ?? null;
};
