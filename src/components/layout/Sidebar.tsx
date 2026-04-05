/**
 * Sidebar.tsx — Menú lateral del panel profesional.
 * Para agregar una opción al menú: agregar un objeto al array MENU_ITEMS.
 * Para agregar una sección nueva: también registrar la ruta en App.tsx.
 */
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

// Para agregar o quitar opciones: modificar este array
const MENU_ITEMS = [
  { path: "/panel",            label: "Agenda de hoy",    icon: "📅" },
  { path: "/panel/manana",     label: "Agenda de mañana", icon: "🌅" },
  { path: "/panel/cola",       label: "Sala de espera",   icon: "🪑" },
  { path: "/panel/servicios",  label: "Servicios",        icon: "🩺" },
  { path: "/panel/horarios",   label: "Horarios",         icon: "🕐" },
  { path: "/panel/clientes",   label: "Clientes",         icon: "👥" },
  { path: "/panel/perfil",     label: "Mi perfil",        icon: "⚙️" },
];

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Marca */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="font-display text-xl font-bold text-navy-DEFAULT">
          Turno<span className="text-blue-600">Pro</span>
        </div>
        <div className="text-xs text-gray-400 mt-0.5 truncate">{user?.name}</div>
      </div>

      {/* Menú */}
      <nav className="flex-1 p-3 space-y-0.5">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/panel"}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Ver mi página pública */}
      {user?.slug && (
        <div className="p-3 border-t border-gray-100">
          <a
            href={`/${user.slug}`}
            target="_blank"
            rel="noreferrer"
            className="sidebar-link text-xs"
          >
            🌐 Ver mi página
          </a>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
