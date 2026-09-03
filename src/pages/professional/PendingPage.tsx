/**
 * PendingPage.tsx — Todas las citas PENDING del profesional, de cualquier fecha,
 * ordenadas por la más próxima primero. Sin esto, con autoConfirm=false, la única
 * forma de encontrar una solicitud nueva era navegar el calendario día por día
 * (reportado por el usuario 2026-09-03).
 * Solo tiene sentido para profesionales con autoConfirm=false — con autoConfirm=true
 * nunca hay nada acá, ver ProfessionalLayout para el criterio de cuándo mostrarla.
 */
import { usePending, useConfirmAppointment, useCancelAppointment } from "@/hooks/useAppointments";
import { PageLoader } from "@/components/ui/Spinner";
import { formatDate } from "@/utils/dates";
import { useVerticalConfig } from "@/hooks/useVerticalConfig";
import type { Appointment } from "@/types";

export const PendingPage = () => {
  const { data: appointments = [], isLoading, isError, error, refetch } = usePending();
  const confirmAppt = useConfirmAppointment();
  const cancelAppt  = useCancelAppointment();
  const vc = useVerticalConfig();

  if (isLoading) return <PageLoader />;

  return (
    <div className="page">
      <div className="section-hd">
        <div>
          <h1 className="page-title">🕓 Pendientes</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {vc.appointmentLabelPlural} que esperan tu aceptación, de cualquier día
          </p>
        </div>
      </div>

      {isError ? (
        // Antes de este fix, una falla acá (endpoint recién desplegándose, red caída)
        // se veía IDÉNTICA a "no hay pendientes" — el fallback `= []` de arriba lo
        // disfrazaba de lista vacía en vez de mostrar que algo falló.
        <div className="card py-12 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-gray-600 font-medium">No se pudieron cargar las pendientes</p>
          {error && <p className="text-xs text-gray-400 mt-1">{(error as any)?.response?.data?.message || (error as Error).message}</p>}
          <button onClick={() => refetch()} className="btn btn-outline btn-sm mt-4">Reintentar</button>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card py-12 text-center text-gray-400">
          <div className="text-4xl mb-3">✨</div>
          <p className="font-medium text-sm">No hay {vc.appointmentLabelPlural.toLowerCase()} pendientes</p>
        </div>
      ) : (
        <div className="card">
          {appointments.map((appt: Appointment) => (
            <div key={appt.id} className="px-4 py-3.5 border-b border-gray-100 last:border-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-0.5">
                    {formatDate(appt.date)} · {appt.startTime?.substring(0, 5)}hs
                  </div>
                  <div className="font-semibold text-sm text-gray-900 truncate">{appt.client?.name}</div>
                  {appt.service?.name && (
                    <div className="text-xs text-gray-400 truncate">
                      🩺 {appt.service.name}
                      {appt.service.durationMinutes && (
                        <span className="text-gray-300"> · {appt.service.durationMinutes} min</span>
                      )}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-0.5">📱 {appt.client?.phone}</div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => confirmAppt.mutate(appt.id)}
                    disabled={confirmAppt.isPending || cancelAppt.isPending}
                    className="btn btn-xs btn-success disabled:opacity-50 disabled:cursor-not-allowed">
                    ✓ Aceptar
                  </button>
                  <button
                    onClick={() => { if (window.confirm(`¿Rechazar la ${vc.appointmentLabel.toLowerCase()} de ${appt.client?.name}?`)) cancelAppt.mutate(appt.id); }}
                    disabled={confirmAppt.isPending || cancelAppt.isPending}
                    className="btn btn-xs btn-danger disabled:opacity-50 disabled:cursor-not-allowed">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
