/**
 * TomorrowPage.tsx — Agenda de mañana con envío de recordatorios WhatsApp.
 * El botón "Enviar WhatsApp" abre wa.me con el mensaje pre-cargado.
 */
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
    const name    = appt.client?.name ?? "";
    const proName = user?.name ?? "";
    const appUrl  = import.meta.env.VITE_APP_URL || window.location.origin;
    const confirmLink = `${appUrl}/cita/${appt.token}/reconfirmar`;
    const cancelLink  = `${appUrl}/cita/${appt.token}/cancelar`;
    const tomorrow    = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long" });

    const msg = encodeURIComponent(
      `Hola ${name}! 👋 Te recordamos tu cita mañana:

` +
      `📅 ${dateStr}
⏰ ${appt.startTime}hs
👨‍⚕️ ${proName}

` +
      `¿Vas a asistir?

` +
      `✅ SÍ confirmo → ${confirmLink}
❌ No puedo ir → ${cancelLink}`
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
          <p className="text-sm text-gray-400 mt-1">{formatDate(
            new Date(Date.now() + 86400000).toISOString().split("T")[0]
          )}</p>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3.5 mb-5">
          <p className="text-sm text-blue-800">
            📋 Tenés <strong>{pendingCount} paciente{pendingCount > 1 ? "s" : ""}</strong> sin recordatorio enviado
          </p>
        </div>
      )}

      {isLoading ? <PageLoader /> : (
        <div className="card">
          {appointments.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <div className="text-4xl mb-3">✨</div>
              <p className="font-medium">No hay citas para mañana</p>
            </div>
          ) : (
            appointments.map((appt) => (
              <div key={appt.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
                <div className="font-display text-lg font-bold w-14 flex-shrink-0" style={{ color: "#0f2342" }}>
                  {appt.startTime}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900">{appt.client?.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {appt.service?.name} · 📱 {appt.client?.phone}
                  </div>
                </div>
                <div>
                  {appt.reminderSent
                    ? <span className="badge badge-teal">📨 Enviado</span>
                    : <button onClick={() => handleSend(appt)} className="btn btn-wa btn-sm">💬 Enviar WhatsApp</button>
                  }
                </div>
              </div>
            ))
          )}
        </div>
      )}
      <p className="text-xs text-gray-400 text-center mt-4">
        Al pulsar "Enviar WhatsApp" se abrirá el chat del paciente con el mensaje pre-cargado
      </p>
    </div>
  );
};
