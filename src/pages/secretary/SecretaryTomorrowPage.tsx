/**
 * SecretaryTomorrowPage.tsx
 * Igual que TomorrowPage del profesional pero para el profesional activo de la secretaria:
 *   - Usa hooks *ForProfessional que pasan professionalId como query param
 *   - Guard si no hay profesional seleccionado
 */
import { useState } from "react";
import { useTomorrowForProfessional, useMarkReminderForProfessional } from "@/hooks/useAppointments";
import { PageLoader, Spinner } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/utils/dates";
import { useAuthStore, useActiveProfessional } from "@/store/auth.store";
import { appointmentsApi } from "@/api/appointments.api";
import toast from "@/utils/toast";
import type { Appointment } from "@/types";
import { useVerticalConfig } from "@/hooks/useVerticalConfig";
import { waUrl } from "@/utils/whatsapp";

export const SecretaryTomorrowPage = () => {
  const activeProfessionalId = useAuthStore((s) => s.activeProfessionalId);
  const activeProfessional   = useActiveProfessional();
  const vc = useVerticalConfig(activeProfessional?.professionalType);

  const { data: appointments = [], isLoading } = useTomorrowForProfessional(activeProfessionalId);
  const markReminder = useMarkReminderForProfessional(activeProfessionalId);

  const pendingCount = appointments.filter((a) => !a.reminderSent).length;

  const buildWALink = (appt: Appointment) => {
    const phone   = appt.client?.phone?.replace(/[^0-9+]/g, "") ?? "";
    const appUrl  = import.meta.env.VITE_APP_URL || window.location.origin;
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr  = tomorrow.toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long" });
    const msg =
      `Hola ${appt.client?.name}! 👋 Te recordamos tu ${vc.appointmentLabel.toLowerCase()} mañana:\n\n` +
      `📅 ${dateStr}\n⏰ ${appt.startTime}hs\n👨‍⚕️ ${activeProfessional?.name}\n\n` +
      `¿Vas a asistir?\n\n` +
      `✅ Confirmar → ${appUrl}/cita/${appt.token}/reconfirmar\n` +
      `❌ Cancelar  → ${appUrl}/cita/${appt.token}/cancelar`;
    return waUrl(phone, msg);
  };

  const handleWA = (appt: Appointment) => {
    window.open(buildWALink(appt), "_blank");
    markReminder.mutate(appt.id);
  };

  if (!activeProfessionalId) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p className="text-4xl mb-3">👆</p>
        <p className="font-medium text-gray-600">Seleccioná un profesional para ver su agenda de mañana</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="section-hd">
        <div>
          <h1 className="page-title">🌅 Agenda de mañana</h1>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(
            new Date(Date.now() + 86400000).toISOString().split("T")[0]
          )}</p>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-blue-800">
            📋 <strong>{pendingCount}</strong> {pendingCount > 1 ? vc.clientLabelPlural.toLowerCase() : vc.clientLabel.toLowerCase()} sin recordatorio
          </p>
        </div>
      )}

      {isLoading ? <PageLoader /> : (
        <div className="card">
          {appointments.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-sm font-medium">No hay citas para mañana</p>
            </div>
          ) : (
            appointments.map((appt) => (
              <AppointmentRow
                key={appt.id}
                appt={appt}
                professionalId={activeProfessionalId}
                clientLabel={vc.clientLabel}
                onWA={() => handleWA(appt)}
              />
            ))
          )}
        </div>
      )}
      <p className="text-xs text-gray-400 text-center mt-4 px-4">
        Al pulsar WhatsApp se abrirá el chat con el mensaje pre-cargado
      </p>
    </div>
  );
};

// ── Fila de cita ──────────────────────────────────────────────────────────────
const AppointmentRow = ({
  appt, professionalId, onWA, clientLabel = "Cliente",
}: { appt: Appointment; professionalId: number; onWA: () => void; clientLabel?: string }) => {
  const [loadingEmail, setLoadingEmail] = useState(false);
  const isDone = ["cancelled", "completed", "expired"].includes(appt.status);

  const handleEmail = async () => {
    setLoadingEmail(true);
    try {
      await appointmentsApi.sendReminderForProfessional(appt.id, professionalId);
      toast.success("Email enviado");
    } catch {
      toast.error("No se pudo enviar el email");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="px-4 py-3.5 border-b border-gray-100 last:border-0">
      {/* Fila principal */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-display text-base font-bold flex-shrink-0" style={{ color: "#0f2342" }}>
            {appt.startTime?.substring(0,5)}
          </span>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate">{appt.client?.name}</div>
            {appt.service?.name ? (
              <div className="text-xs text-gray-400 truncate">
                🩺 {appt.service.name}
                {appt.service.durationMinutes && (
                  <span className="text-gray-300"> · {appt.service.durationMinutes} min</span>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-400 truncate">📱 {appt.client?.phone}</div>
            )}
          </div>
        </div>
        <StatusBadge status={appt.status} />
      </div>

      {appt.service?.name && (
        <div className="mt-1 ml-11">
          <span className="text-xs text-gray-400">📱 {appt.client?.phone}</span>
        </div>
      )}

      {!isDone && (
        <div className="flex gap-2 mt-2 ml-11">
          <>
            <button onClick={handleEmail} disabled={loadingEmail}
              className="btn btn-xs btn-outline disabled:opacity-50 disabled:cursor-not-allowed">
              {loadingEmail ? <><Spinner size="sm" /> Enviando...</> : "📧 Email"}
            </button>
            <button onClick={onWA} className="btn btn-xs btn-wa">
              💬 WhatsApp
            </button>
            {appt.reminderSent && (
              <span className="text-xs text-teal-600">✓ Enviado</span>
            )}
          </>
        </div>
      )}
    </div>
  );
};
