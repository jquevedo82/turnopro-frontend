/**
 * ProtectedRoute.tsx
 *
 * FIX: Lee el token directamente de localStorage como fuente de verdad primaria.
 * Esto evita condiciones de carrera entre Zustand y React Router en el primer render.
 */
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  role?: "superadmin" | "professional" | "secretary";
}

// Mapa rol → ruta de su panel
const ROLE_HOME: Record<string, string> = {
  superadmin:   "/admin",
  professional: "/panel",
  secretary:    "/secretaria",
};

export const ProtectedRoute = ({ children, role }: Props) => {
  const token = localStorage.getItem("tp_token");
  const user  = JSON.parse(localStorage.getItem("tp_user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Tiene token pero el rol no coincide: redirige al panel correcto
    const correctPath = ROLE_HOME[user.role] ?? "/login";
    return <Navigate to={correctPath} replace />;
  }

  return <>{children}</>;
};
