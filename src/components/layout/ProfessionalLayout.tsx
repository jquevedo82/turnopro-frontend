/**
 * ProfessionalLayout.tsx
 * Desktop: sidebar lateral fijo izquierdo
 * Mobile: barra de navegación fija abajo (bottom nav)
 */
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";

const MENU = [
  { path: "/panel",           label: "Hoy",          icon: "📅", end: true  },
  { path: "/panel/manana",    label: "Mañana",        icon: "🌅", end: false },
  { path: "/panel/cola",      label: "Sala espera",   icon: "🪑", end: false },
  { path: "/panel/servicios", label: "Servicios",     icon: "🩺", end: false },
  { path: "/panel/horarios",  label: "Horarios",      icon: "🕐", end: false },
  { path: "/panel/clientes",  label: "Clientes",      icon: "👥", end: false },
  { path: "/panel/perfil",    label: "Perfil",        icon: "⚙️",  end: false },
];

export const ProfessionalLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Sidebar desktop (md+) ──────────────────────────────────────── */}
      <aside className="hidden md:flex w-56 min-h-screen bg-white border-r border-gray-200 flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="font-display text-xl font-bold" style={{ color: "#0f2342" }}>
            Turno<span className="text-blue-600">Pro</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5 truncate">{user?.name}</div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {MENU.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        {user?.slug && (
          <div className="p-3 border-t border-gray-100">
            <a href={`/${user.slug}`} target="_blank" rel="noreferrer" className="sidebar-link text-xs">
              🌐 Ver mi página
            </a>
          </div>
        )}
        <div className="p-3 border-t border-gray-100">
          <button onClick={handleLogout}
            className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Header mobile (< md) ──────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="font-display text-lg font-bold" style={{ color: "#0f2342" }}>
          Turno<span className="text-blue-600">Pro</span>
        </div>
        <div className="flex items-center gap-2">
          {user?.slug && (
            <a href={`/${user.slug}`} target="_blank" rel="noreferrer"
              className="text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5">
              🌐 Mi página
            </a>
          )}
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 p-2 rounded-lg">
            🚪
          </button>
        </div>
      </div>

      {/* ── Contenido principal ───────────────────────────────────────── */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0 pt-16 md:pt-0">
        <Outlet />
      </main>

      {/* ── Bottom navigation mobile (< md) ──────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1 flex items-center safe-bottom"
           style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {MENU.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.end}
            className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
            <span className="text-xl leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
