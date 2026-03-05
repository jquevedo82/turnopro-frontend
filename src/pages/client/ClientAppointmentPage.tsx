/**
 * ClientAppointmentPage.tsx
 * Página de gestión de cita para el cliente. Acceso via token único.
 * URL: /cita/:token
 * Permite ver el estado, reconfirmar y cancelar.
 */
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useAppointmentByToken } from "@/hooks/useAppointments";
import { appointmentsApi } from "@/api/appointments.api";
import { PageLoader } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/utils/dates";

export const ClientAppointmentPage = () => {
  const { token = "" } = useParams<{ token: string }>();
  const { data: appt, isLoading, refetch } = useAppointmentByToken(token);
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState("");

  if (isLoading) return <PageLoader />;
  if (!appt) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="text-5xl mb-4">🔍</div>
        <p className="font-display text-xl text-gray-600">Cita no encontrada</p>
      </div>
    </div>
  );

  const { client, service, professional } = appt;
  const now = new Date();
  const apptTime = new Date(`${appt.date}T${appt.startTime}`);
  const hoursUntil = (apptTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel  = hoursUntil >= professional.cancellationHours && ["confirmed","pending","reconfirmed"].includes(appt.status);
  const canReconfirm = appt.status === "confirmed";

  const handleReconfirm = async () => {
    setLoading(true);
    await appointmentsApi.reconfirmByToken(token);
    await refetch();
    setMessage("✅ ¡Confirmado! Nos vemos pronto.");
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!confirm("¿Seguro que querés cancelar la cita?")) return;
    setLoading(true);
    try {
      await appointmentsApi.cancelByToken(token);
      await refetch();
      setMessage("Tu cita fue cancelada. Podés reservar una nueva cuando quieras.");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "No se pudo cancelar la cita.");
    }
    setLoading(false);
  };

  const isCancelled = ["cancelled","rejected","expired"].includes(appt.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="font-display text-2xl font-bold text-navy-DEFAULT mb-1" style={{ color: "#0f2342" }}>
            Turno<span className="text-blue-600">Pro</span>
          </div>
          <p className="text-gray-400 text-sm">Gestión de tu cita</p>
        </div>

        {/* Estado */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-4 text-center">
            <p className="text-red-700 font-semibold text-sm">Esta cita fue cancelada o expiró</p>
          </div>
        )}

        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-4 text-center">
            <p className="text-blue-700 text-sm">{message}</p>
          </div>
        )}

        {/* Detalle */}
        <div className="card mb-4">
          <div className="card-header">
            <span className="card-title">Detalle de tu cita</span>
            <StatusBadge status={appt.status} />
          </div>
          <div className="card-body space-y-4">
            {[
              { icon: "👤", label: "Paciente",    val: client?.name },
              { icon: "🩺", label: "Servicio",    val: service?.name },
              { icon: "📅", label: "Fecha",       val: formatDate(appt.date) },
              { icon: "⏰", label: "Hora",        val: `${appt.startTime}hs` },
              { icon: "👨‍⚕️", label: "Profesional", val: professional?.name },
              { icon: "📍", label: "Dirección",   val: professional?.address },
            ].filter(r => r.val).map(({ icon, label, val }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-base flex-shrink-0">{icon}</div>
                <div>
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</div>
                  <div className="text-sm font-medium text-gray-800 mt-0.5">{val}</div>
                </div>
              </div>
            ))}
            {appt.notes && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Nota:</div>
                <div className="text-sm text-gray-700">{appt.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        {!isCancelled && !message && (
          <div className="space-y-3">
            {canReconfirm && (
              <button onClick={handleReconfirm} disabled={loading} className="btn btn-success btn-full">
                ✅ Confirmar asistencia
              </button>
            )}
            {appt.status === "reconfirmed" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-center">
                <p className="text-emerald-700 font-semibold text-sm">✓ Asistencia confirmada</p>
              </div>
            )}
            {canCancel && (
              <button onClick={handleCancel} disabled={loading} className="btn btn-outline btn-full text-red-500 border-red-200 hover:bg-red-50">
                ✕ Cancelar cita
              </button>
            )}
            {!canCancel && !isCancelled && hoursUntil < professional.cancellationHours && (
              <p className="text-xs text-gray-400 text-center">
                El plazo de cancelación ya venció ({professional.cancellationHours}hs de anticipación)
              </p>
            )}
          </div>
        )}

        {/* Volver a reservar */}
        {isCancelled && (
          <a href={`/${professional.slug}`} className="btn btn-primary btn-full mt-2">
            Reservar nueva cita
          </a>
        )}
      </div>
    </div>
  );
};
