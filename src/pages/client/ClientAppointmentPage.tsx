/**
 * ClientAppointmentPage.tsx — Mobile-first.
 * URL: /cita/:token          — ver cita
 * URL: /cita/:token/cancelar — cancelar directo desde el link del email
 */
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppointmentByToken } from "@/hooks/useAppointments";
import { appointmentsApi } from "@/api/appointments.api";
import { PageLoader } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/utils/dates";

export const ClientAppointmentPage = ({ autoCancel = false }: { autoCancel?: boolean }) => {
  const { token = "" } = useParams<{ token: string }>();
  const { data: appt, isLoading, refetch } = useAppointmentByToken(token);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Si viene de /cancelar en el email, ejecuta la cancelación automáticamente
  useEffect(() => {
    if (autoCancel && appt && !message) {
      action("cancel");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCancel, appt?.id]);

  const action = async (type: "reconfirm" | "cancel") => {
    setLoading(true);
    try {
      if (type === "reconfirm") await appointmentsApi.reconfirmByToken(token);
      else                      await appointmentsApi.cancelByToken(token);
      await refetch();
      setMessage(type === "reconfirm" ? "✅ Tu cita fue confirmada" : "Tu cita fue cancelada");
    } catch (e: any) {
      setMessage(e.response?.data?.message || "Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <PageLoader />;
  if (!appt) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="font-display text-xl text-gray-600">Cita no encontrada</p>
        <p className="text-sm text-gray-400 mt-2">Verificá el link que recibiste por email</p>
      </div>
    </div>
  );

  const isCancelled = appt.status === "cancelled";
  const isCompleted = ["completed", "no_show"].includes(appt.status);
  const canAct      = !isCancelled && !isCompleted && appt.status !== "expired";

  return (
    <div className="min-h-screen bg-gray-50" style={{ background: "linear-gradient(180deg, #f0f5ff 0%, #f9fafb 100%)" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f2342 0%, #1a3a6b 100%)" }} className="text-white px-4 py-8 text-center">
        <div className="text-4xl mb-3">📅</div>
        <h1 className="font-display text-2xl font-bold">Tu cita</h1>
        <p className="text-blue-300 text-sm mt-1">Podés confirmar o cancelar desde acá</p>
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-4">

        {/* Card de la cita */}
        <div className="card overflow-hidden">
          <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-800">Estado de tu cita</span>
            <StatusBadge status={appt.status} />
          </div>
          <div className="divide-y divide-gray-100">
            {[
              { icon: "👨‍⚕️", label: "Profesional", value: appt.professional?.name },
              { icon: "🩺", label: "Servicio",     value: appt.service?.name },
              { icon: "📅", label: "Fecha",        value: formatDate(appt.date) },
              { icon: "⏰", label: "Hora",         value: `${appt.startTime}hs` },
              { icon: "📍", label: "Dirección",    value: appt.professional?.address },
              { icon: "📞", label: "Teléfono",     value: appt.professional?.phone },
            ].filter((r) => r.value).map((row) => (
              <div key={row.label} className="flex items-center gap-3 px-5 py-3">
                <span className="text-lg flex-shrink-0">{row.icon}</span>
                <div>
                  <div className="text-xs text-gray-400">{row.label}</div>
                  <div className="text-sm font-medium text-gray-900">{row.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mensaje feedback */}
        {message && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium text-center ${
            message.startsWith("✅") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message}
          </div>
        )}

        {/* Acciones */}
        {canAct && !message && (
          <div className="space-y-2.5">
            {appt.status !== "reconfirmed" && (
              <button onClick={() => action("reconfirm")} disabled={loading}
                className="btn btn-success btn-full disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Procesando..." : "✅ Confirmar mi asistencia"}
              </button>
            )}
            <button onClick={() => action("cancel")} disabled={loading}
              className="btn btn-outline btn-full text-red-500 border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed">
              ❌ Cancelar la cita
            </button>
          </div>
        )}

        {isCancelled && (
          <div className="text-center py-4 text-gray-400 text-sm">
            Esta cita fue cancelada.
          </div>
        )}

        {/* Botón WhatsApp al profesional */}
        {appt.professional?.whatsappPhone || appt.professional?.phone ? (
          <a
            href={`https://wa.me/${(appt.professional.whatsappPhone || appt.professional.phone).replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(
              `Hola ${appt.professional?.name}, le escribo por mi cita del ${appt.date} a las ${appt.startTime?.substring(0,5)}hs.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white mt-2"
            style={{ background: "#25d366" }}
          >
            💬 Escribir al profesional por WhatsApp
          </a>
        ) : null}

        <p className="text-center text-xs text-gray-400 pb-4">
          TurnoPro • Tu turno en un clic
        </p>
      </div>
    </div>
  );
};