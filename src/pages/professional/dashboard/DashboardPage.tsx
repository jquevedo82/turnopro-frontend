/**
 * DashboardPage.tsx — Agenda de hoy del profesional.
 * Muestra las citas del día con sus estados y acciones rápidas.
 */
import { useState } from "react";
import { useToday, useCancelAppointment, useCompleteAppointment } from "@/hooks/useAppointments";
import { StatusBadge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { formatDate, today } from "@/utils/dates";
import type { Appointment } from "@/types";

export const DashboardPage = () => {
  const [date, setDate] = useState(today());
  const { data: appointments = [], isLoading } = useToday(date);
  const cancelAppt   = useCancelAppointment();
  const completeAppt = useCompleteAppointment();

  const noResponse = appointments.filter((a) => a.status === "confirmed" && !a.reminderSent);
  const stats = {
    total:     appointments.filter((a) => a.status !== "cancelled" && a.status !== "expired").length,
    confirmed: appointments.filter((a) => a.status === "confirmed" || a.status === "reconfirmed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    pending:   appointments.filter((a) => a.status === "pending").length,
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="section-hd">
        <div>
          <h1 className="page-title">📅 Agenda de hoy</h1>
          <p className="text-sm text-gray-400 mt-1">{formatDate(date)}</p>
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="form-input w-auto text-sm" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",      value: stats.total,     sub: "citas del día" },
          { label: "Confirmadas",value: stats.confirmed, sub: "asistirán" },
          { label: "Pendientes", value: stats.pending,   sub: "sin acción" },
          { label: "Canceladas", value: stats.cancelled, sub: "no vienen" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Alerta sin respuesta */}
      {noResponse.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-5 flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm text-amber-800 font-medium">
            ⚠️ {noResponse.length} cita{noResponse.length > 1 ? "s" : ""} sin recordatorio enviado
          </span>
          <span className="text-xs text-amber-600">Verificá en Agenda de mañana</span>
        </div>
      )}

      {/* Lista de citas */}
      {isLoading ? <PageLoader /> : (
        <div className="card">
          {appointments.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-medium">No hay citas para este día</p>
            </div>
          ) : (
            appointments.map((appt) => (
              <AppointmentRow key={appt.id} appt={appt}
                onCancel={() => cancelAppt.mutate(appt.id)}
                onComplete={() => completeAppt.mutate(appt.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const AppointmentRow = ({ appt, onCancel, onComplete }: { appt: Appointment; onCancel: () => void; onComplete: () => void }) => (
  <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
    <div className="font-display text-lg font-bold text-navy-DEFAULT w-14 flex-shrink-0" style={{ color: "#0f2342" }}>
      {appt.startTime}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-sm text-gray-900">{appt.client?.name}</div>
      <div className="text-xs text-gray-400 mt-0.5 truncate">
        {appt.service?.name} · 📱 {appt.client?.phone}
      </div>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <StatusBadge status={appt.status} />
      {(appt.status === "confirmed" || appt.status === "reconfirmed") && (
        <>
          <button onClick={onComplete} className="btn btn-xs btn-success">✓ Completar</button>
          <button onClick={onCancel}   className="btn btn-xs btn-danger">✕</button>
        </>
      )}
      {appt.status === "pending" && (
        <button onClick={onCancel} className="btn btn-xs btn-danger">✕ Rechazar</button>
      )}
    </div>
  </div>
);
