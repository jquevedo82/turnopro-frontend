import { useTomorrow, useMarkReminder } from "@/hooks/useAppointments";
import { PageLoader } from "@/components/ui/Spinner";
import { formatDate } from "@/utils/dates";
import type { Appointment } from "@/types";
import { useAuthStore } from "@/store/auth.store";

export const TomorrowPage = () => {
  const { data: appointments = [], isLoading } = useTomorrow();
  const markReminder = useMarkReminder();
  const { user } = useAuthStore();

  const pendingCount = appointments.filter((a) => !a.reminderSent).length;

  const buildWALink = (appt: Appointment) => {
    const phone   = appt.client?.phone?.replace(/[^0-9+]/g, "") ?? "";
    const appUrl  = import.meta.env.VITE_APP_URL || window.location.origin;
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr  = tomorrow.toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long" });
    const msg = encodeURIComponent(
      `Hola ${appt.client?.name}! 👋 Te recordamos tu cita mañana:\n\n` +
      `📅 ${dateStr}\n⏰ ${appt.startTime}hs\n👨‍⚕️ ${user?.name}\n\n` +
      `¿Vas a asistir?\n\n` +
      `✅ Confirmar → ${appUrl}/cita/${appt.token}/reconfirmar\n` +
      `❌ Cancelar  → ${appUrl}/cita/${appt.token}/cancelar`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  };

  const handleSend = (appt: Appointment) => {
    window.open(buildWALink(appt), "_blank");
    markReminder.mutate(appt.id);
  };

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
            📋 <strong>{pendingCount}</strong> paciente{pendingCount > 1 ? "s" : ""} sin recordatorio
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
              <div key={appt.id} className="px-4 py-3.5 border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-display text-base font-bold flex-shrink-0" style={{ color: "#0f2342" }}>
                      {appt.startTime}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">{appt.client?.name}</div>
                      <div className="text-xs text-gray-400">📱 {appt.client?.phone}</div>
                    </div>
                  </div>
                  {appt.reminderSent
                    ? <span className="badge badge-teal flex-shrink-0">✓ Enviado</span>
                    : <button onClick={() => handleSend(appt)}
                        className="btn btn-wa btn-sm flex-shrink-0">
                        💬 WhatsApp
                      </button>
                  }
                </div>
              </div>
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
