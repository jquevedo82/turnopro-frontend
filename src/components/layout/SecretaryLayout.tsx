/**
 * SecretaryLayout.tsx
 * Layout del panel de secretaria. Incluye:
 *   - Header con selector "Trabajando como: Dr. García"
 *   - Sidebar con navegación simplificada
 *   - Outlet para las páginas hijas
 *
 * Si la secretaria aún no seleccionó un profesional activo,
 * muestra la pantalla de selección antes de entrar al panel.
 */
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore, useActiveProfessional } from "@/store/auth.store";
import type { SecretaryProfessional } from "@/types";

export const SecretaryLayout = () => {
  const user = useAuthStore((s) => s.user);
  const activeProfessionalId = useAuthStore((s) => s.activeProfessionalId);
  const setActive = useAuthStore((s) => s.setActiveProfessional);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const activeProfessional = useActiveProfessional();

  const professionals: SecretaryProfessional[] = user?.professionals ?? [];

  // ── Si no hay profesional activo: mostrar selector ────────────────────────
  if (!activeProfessionalId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">TurnoPro</h1>
            <p className="text-gray-500 mt-1">Hola, {user?.name}</p>
            <p className="text-sm text-gray-400 mt-3">
              ¿Con qué profesional vas a trabajar hoy?
            </p>
          </div>

          <div className="space-y-3">
            {professionals.map((prof) => (
              <button
                key={prof.id}
                onClick={() => setActive(prof.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200
                           hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                {/* Avatar o inicial */}
                <div
                  className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center
                                text-blue-700 font-bold text-lg flex-shrink-0 overflow-hidden"
                >
                  {prof.avatar ? (
                    <img
                      src={prof.avatar}
                      alt={prof.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    prof.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{prof.name}</p>
                  <p className="text-sm text-gray-500">{prof.profession}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="mt-8 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // ── Panel completo con profesional activo ─────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 min-h-screen bg-white border-r border-gray-200 flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div
            className="font-display text-xl font-bold"
            style={{ color: "#0f2342" }}
          >
            Turno<span className="text-blue-600">Pro</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Panel secretaria</p>
        </div>

        {/* Selector de profesional activo */}
        <div className="p-3 border-b border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2 px-1">
            Trabajando como
          </p>
          <div className="relative">
            <select
              value={activeProfessionalId}
              onChange={(e) => setActive(Number(e.target.value))}
              className="w-full text-sm font-medium text-gray-800 bg-blue-50 border border-blue-200
                         rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none
                         focus:ring-2 focus:ring-blue-300"
            >
              {professionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              ▼
            </span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-3 space-y-1">
          {[
            { to: "/secretaria", label: "Agenda", icon: "📅", end: true },
            { to: "/secretaria/manana", label: "Mañana", icon: "🌅" },
            { to: "/secretaria/nueva-cita", label: "Nueva cita", icon: "➕" },
            { to: "/secretaria/cola", label: "Sala de espera", icon: "🪑" },
            { to: "/secretaria/clientes", label: "Clientes", icon: "👥" },
          ].map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Link a la página pública del profesional activo */}
        {activeProfessional?.slug && (
          <div className="p-3 border-t border-gray-100">
            <a
              href={`/${activeProfessional.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors px-1"
            >
              🌐 Ver página de {activeProfessional.name}
            </a>
          </div>
        )}

        {/* Footer — info de la secretaria */}
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="mt-3 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      {/* ── Header mobile (< md) ──────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div
          className="font-display text-lg font-bold"
          style={{ color: "#0f2342" }}
        >
          Turno<span className="text-blue-600">Pro</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Selector de profesional activo */}
          <div className="p-3 border-b border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2 px-1">
              Trabajando como
            </p>
            <div className="relative">
              <select
                value={activeProfessionalId}
                onChange={(e) => setActive(Number(e.target.value))}
                className="w-full text-sm font-medium text-gray-800 bg-blue-50 border border-blue-200
                         rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none
                         focus:ring-2 focus:ring-blue-300"
              >
                {professionals.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                ▼
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-gray-400 hover:text-red-500 p-2 rounded-lg"
          >
            🚪
          </button>
        </div>
      </div>
      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        {/* Banner del profesional activo */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center
                          text-blue-700 font-bold text-sm overflow-hidden flex-shrink-0"
          >
            {activeProfessional?.avatar ? (
              <img
                src={activeProfessional.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              activeProfessional?.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-none">
              {activeProfessional?.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeProfessional?.profession}
            </p>
          </div>
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
