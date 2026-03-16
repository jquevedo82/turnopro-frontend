/**
 * AdminSidebar.tsx — Menú del panel superadmin.
 * Para agregar opciones: modificar ADMIN_MENU.
 */
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

const ADMIN_MENU = [
  { path: "/admin",                  label: "Dashboard",      icon: "📊", end: true },
  { path: "/admin/profesionales",    label: "Profesionales",  icon: "👨‍⚕️" },
  { path: "/admin/organizaciones",   label: "Organizaciones", icon: "🏥" },
  { path: "/admin/planes",           label: "Planes",         icon: "📋" },
];

export const AdminSidebar = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside className="w-56 min-h-screen bg-navy-DEFAULT flex flex-col" style={{ background: "#0f2342" }}>
      <div className="px-5 py-5 border-b border-white/10">
        <div className="font-display text-xl font-bold text-white">
          Turno<span className="text-blue-400">Pro</span>
        </div>
        <div className="text-xs text-blue-300 mt-0.5">Panel Admin</div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {ADMIN_MENU.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
               ${isActive ? "bg-blue-600 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white w-full transition-all"
        >
          🚪 Salir
        </button>
      </div>
    </aside>
  );
};