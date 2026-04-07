/**
 * App.tsx — Router principal de la aplicación.
 *
 * Para AGREGAR una nueva página:
 *   1. Crear el componente en src/pages/
 *   2. Importarlo aquí
 *   3. Agregar un <Route> en la sección correspondiente
 *   4. Si es una ruta del panel: agregar también en el layout correspondiente
 *
 * Para QUITAR una página: eliminar su <Route> y el import
 */
import { Routes, Route, Navigate } from "react-router-dom";

// Auth
import { LoginPage }          from "@/pages/auth/LoginPage";
import { ProtectedRoute }     from "@/pages/auth/ProtectedRoute";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage }  from "@/pages/auth/ResetPasswordPage";

// Layouts
import { ProfessionalLayout } from "@/components/layout/ProfessionalLayout";
import { AdminLayout }        from "@/components/layout/AdminLayout";
import { SecretaryLayout }    from "@/components/layout/SecretaryLayout";

// Página pública (sin login)
import { PublicPage }       from "@/pages/public/PublicPage";
import { WaitingRoomPage }  from "@/pages/public/WaitingRoomPage";

// Cliente (sin login — acceso por token)
import { ClientAppointmentPage } from "@/pages/client/ClientAppointmentPage";

// Panel profesional
import { DashboardPage }      from "@/pages/professional/dashboard/DashboardPage";
import { NewAppointmentPage } from "@/pages/professional/NewAppointmentPage";
import { TomorrowPage }       from "@/pages/professional/dashboard/TomorrowPage";
import { ServicesPage }       from "@/pages/professional/services/ServicesPage";
import { SchedulePage }       from "@/pages/professional/schedule/SchedulePage";
import { ProfilePage }        from "@/pages/professional/profile/ProfilePage";
import { ClientsPage }        from "@/pages/professional/ClientsPage";
import { QueuePage }          from "@/pages/professional/queue/QueuePage";

// Panel superadmin
import { AdminDashboard }    from "@/pages/superadmin/AdminDashboard";
import { ProfessionalsPage } from "@/pages/superadmin/ProfessionalsPage";
import { PlansPage }         from "@/pages/superadmin/PlansPage";

// Panel secretaria
import { SecretaryDashboardPage }  from "@/pages/secretary/SecretaryDashboardPage";
import { SecretaryNewAppointment } from "@/pages/secretary/SecretaryNewAppointment";
import { SecretaryClientsPage }    from "@/pages/secretary/SecretaryClientsPage";
import { SecretaryQueuePage }      from "@/pages/secretary/SecretaryQueuePage";
import { OrganizationsPage } from "./pages/superadmin/OrganizationsPage";

export default function App() {
  return (
    <Routes>
      {/* ── Sin autenticación ──────────────────────────────────────────── */}
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />
      <Route path="/cita/:token"     element={<ClientAppointmentPage />} />
      <Route path="/cita/:token/cancelar" element={<ClientAppointmentPage autoCancel />} />
      {/* Página pública del profesional */}
      <Route path="/:slug"      element={<PublicPage />} />
      {/* Pantalla de sala de espera (TV / tablet en recepción) */}
      <Route path="/sala/:slug" element={<WaitingRoomPage />} />

      {/* ── Panel profesional ──────────────────────────────────────────── */}
      <Route path="/panel" element={
        <ProtectedRoute role="professional">
          <ProfessionalLayout />
        </ProtectedRoute>
      }>
        <Route index              element={<DashboardPage />} />
        <Route path="manana"      element={<TomorrowPage />} />
        <Route path="cola"        element={<QueuePage />} />
        <Route path="servicios"   element={<ServicesPage />} />
        <Route path="horarios"    element={<SchedulePage />} />
        <Route path="clientes"    element={<ClientsPage />} />
        <Route path="nueva-cita"  element={<NewAppointmentPage />} />
        <Route path="perfil"      element={<ProfilePage />} />
      </Route>

      {/* ── Panel secretaria ───────────────────────────────────────────── */}
      <Route path="/secretaria" element={
        <ProtectedRoute role="secretary">
          <SecretaryLayout />
        </ProtectedRoute>
      }>
        <Route index              element={<SecretaryDashboardPage />} />
        <Route path="nueva-cita"  element={<SecretaryNewAppointment />} />
        <Route path="cola"        element={<SecretaryQueuePage />} />
        <Route path="clientes"    element={<SecretaryClientsPage />} />
      </Route>

      {/* ── Panel superadmin ───────────────────────────────────────────── */}
      <Route path="/admin" element={
        <ProtectedRoute role="superadmin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index                element={<AdminDashboard />} />
        <Route path="profesionales" element={<ProfessionalsPage />} />
        <Route path="organizaciones"  element={<OrganizationsPage />} /> 
        <Route path="planes"        element={<PlansPage />} />
      </Route>

      {/* ── Redirects ─────────────────────────────────────────────────── */}
      <Route path="/"  element={<Navigate to="/login" replace />} />
      <Route path="*"  element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
