/**
 * App.tsx — Router principal de la aplicación.
 *
 * Para AGREGAR una nueva página:
 *   1. Crear el componente en src/pages/
 *   2. Importarlo aquí
 *   3. Agregar un <Route> en la sección correspondiente
 *   4. Si es una ruta del panel: agregar también en Sidebar.tsx o AdminSidebar.tsx
 *
 * Para QUITAR una página: eliminar su <Route> y el import
 */
import { Routes, Route, Navigate } from "react-router-dom";

// Auth
import { LoginPage }       from "@/pages/auth/LoginPage";
import { ProtectedRoute }  from "@/pages/auth/ProtectedRoute";

// Layouts
import { ProfessionalLayout } from "@/components/layout/ProfessionalLayout";
import { AdminLayout }        from "@/components/layout/AdminLayout";

// Página pública (sin login)
import { PublicPage }      from "@/pages/public/PublicPage";

// Cliente (sin login — acceso por token)
import { ClientAppointmentPage } from "@/pages/client/ClientAppointmentPage";

// Panel profesional
import { DashboardPage }   from "@/pages/professional/dashboard/DashboardPage";
import { TomorrowPage }    from "@/pages/professional/dashboard/TomorrowPage";
import { ServicesPage }    from "@/pages/professional/services/ServicesPage";
import { SchedulePage }    from "@/pages/professional/schedule/SchedulePage";
import { ProfilePage }     from "@/pages/professional/profile/ProfilePage";

// Panel superadmin
import { AdminDashboard }      from "@/pages/superadmin/AdminDashboard";
import { ProfessionalsPage }   from "@/pages/superadmin/ProfessionalsPage";
import { PlansPage }           from "@/pages/superadmin/PlansPage";

// Clients (placeholder — mostrar lista básica)
import { ClientsPage }     from "@/pages/professional/ClientsPage";

export default function App() {
  return (
    <Routes>
      {/* ── Sin autenticación ──────────────────────────────────────────── */}
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/cita/:token" element={<ClientAppointmentPage />} />
      {/* Página pública del profesional */}
      <Route path="/:slug"      element={<PublicPage />} />

      {/* ── Panel profesional ──────────────────────────────────────────── */}
      <Route path="/panel" element={
        <ProtectedRoute role="professional">
          <ProfessionalLayout />
        </ProtectedRoute>
      }>
        <Route index            element={<DashboardPage />} />
        <Route path="manana"    element={<TomorrowPage />} />
        <Route path="servicios" element={<ServicesPage />} />
        <Route path="horarios"  element={<SchedulePage />} />
        <Route path="clientes"  element={<ClientsPage />} />
        <Route path="perfil"    element={<ProfilePage />} />
      </Route>

      {/* ── Panel superadmin ───────────────────────────────────────────── */}
      <Route path="/admin" element={
        <ProtectedRoute role="superadmin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index                  element={<AdminDashboard />} />
        <Route path="profesionales"   element={<ProfessionalsPage />} />
        <Route path="planes"          element={<PlansPage />} />
      </Route>

      {/* ── Redirects ─────────────────────────────────────────────────── */}
      <Route path="/"     element={<Navigate to="/login" replace />} />
      <Route path="*"     element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
