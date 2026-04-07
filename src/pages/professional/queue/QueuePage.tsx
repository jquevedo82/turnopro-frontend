/**
 * QueuePage.tsx — Panel de sala de espera del profesional.
 * Muestra la cola del día: pacientes confirmados, llegados y en curso.
 * El profesional puede marcar llegada, iniciar consulta y completar.
 * Botón "Ver sala pública" abre /sala/:slug en nueva pestaña (pantalla TV).
 */
import { useState } from "react";
import {
  useQueue, useMarkArrived, useStartConsultation, useCompleteAppointment,
} from "@/hooks/useAppointments";
import { StatusBadge } from "@/components/ui/Badge";
import { PageLoader, Spinner } from "@/components/ui/Spinner";
import { today } from "@/utils/dates";
import { useAuthStore } from "@/store/auth.store";
import { useVerticalConfig } from "@/hooks/useVerticalConfig";
import type { Appointment } from "@/types";

// ── Etiquetas por estado ──────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  confirmed:   "Confirmado",
  reconfirmed: "Reconfirmado",
  arrived:     "Llegó",
  in_progress: "En consulta",
  completed:   "Completado",
};

const STATUS_ORDER: Record<string, number> = {
  in_progress: 0,
  arrived:     1,
  confirmed:   2,
  reconfirmed: 2,
  completed:   3,
};

export const QueuePage = () => {
  const { user }    = useAuthStore();
  const vc          = useVerticalConfig();
  const [date]      = useState(today());

  const { data: queue = [], isLoading } = useQueue(date);
  const markArrived       = useMarkArrived();
  const startConsultation = useStartConsultation();
  const completeAppt      = useCompleteAppointment();

  const sorted = [...queue].sort((a, b) => {
    const oa = STATUS_ORDER[a.status] ?? 9;
    const ob = STATUS_ORDER[b.status] ?? 9;
    if (oa !== ob) return oa - ob;
    // Dentro del mismo grupo, ordenar por arrivedAt si existe, luego startTime
    if (a.arrivedAt && b.arrivedAt) return new Date(a.arrivedAt).getTime() - new Date(b.arrivedAt).getTime();
    return a.startTime.localeCompare(b.startTime);
  });

  const waiting     = sorted.filter((a) => ["arrived"].includes(a.status));
  const inProgress  = sorted.filter((a) => a.status === "in_progress");
  const upcoming    = sorted.filter((a) => ["confirmed", "reconfirmed"].includes(a.status));
  const done        = sorted.filter((a) => a.status === "completed");

  const publicUrl = user?.slug ? `${window.location.origin}/sala/${user.slug}` : null;

  if (isLoading) return <PageLoader />;

  return (
    <div className="page">
      <div className="section-hd">
        <div>
          <h1 className="page-title">🪑 Sala de espera</h1>
          <p className="text-sm text-gray-400 mt-0.5">{date} · {queue.length} {vc.clientLabelPlural.toLowerCase()} en agenda</p>
        </div>
        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary text-sm"
          >
            📺 Ver pantalla TV
          </a>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="card py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">🪑</div>
          <p>No hay {vc.clientLabelPlural.toLowerCase()} confirmados para hoy</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* En consulta */}
          {inProgress.length > 0 && (
            <Section title="En consulta ahora" color="green">
              {inProgress.map((appt) => (
                <QueueCard
                  key={appt.id}
                  appt={appt}
                  clientLabel={vc.clientLabel}
                  onComplete={() => completeAppt.mutate(appt.id)}
                  isLoading={completeAppt.isPending}
                />
              ))}
            </Section>
          )}

          {/* Esperando */}
          {waiting.length > 0 && (
            <Section title={`Esperando (${waiting.length})`} color="blue">
              {waiting.map((appt, idx) => (
                <QueueCard
                  key={appt.id}
                  appt={appt}
                  position={idx + 1}
                  clientLabel={vc.clientLabel}
                  onStart={() => startConsultation.mutate(appt.id)}
                  onComplete={() => completeAppt.mutate(appt.id)}
                  isLoading={startConsultation.isPending || completeAppt.isPending}
                />
              ))}
            </Section>
          )}

          {/* Confirmados (no llegaron aún) */}
          {upcoming.length > 0 && (
            <Section title="Confirmados — no llegaron aún" color="gray">
              {upcoming.map((appt) => (
                <QueueCard
                  key={appt.id}
                  appt={appt}
                  clientLabel={vc.clientLabel}
                  onArrived={() => markArrived.mutate(appt.id)}
                  isLoading={markArrived.isPending}
                />
              ))}
            </Section>
          )}

          {/* Completados */}
          {done.length > 0 && (
            <Section title={`Completados hoy (${done.length})`} color="gray" collapsed>
              {done.map((appt) => (
                <QueueCard key={appt.id} appt={appt} clientLabel={vc.clientLabel} />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
};

// ── Sección colapsable ────────────────────────────────────────────────────────
const SECTION_COLORS: Record<string, string> = {
  green: "border-green-200 bg-green-50",
  blue:  "border-blue-200 bg-blue-50",
  gray:  "border-gray-200 bg-white",
};

const Section = ({
  title, color, collapsed = false, children,
}: {
  title: string; color: string; collapsed?: boolean; children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(!collapsed);
  return (
    <div className={`card border ${SECTION_COLORS[color] ?? SECTION_COLORS.gray}`}>
      <button
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-700"
        onClick={() => setOpen((o) => !o)}
      >
        {title}
        <span className="text-gray-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="divide-y divide-gray-100">{children}</div>}
    </div>
  );
};

// ── Tarjeta de paciente en cola ───────────────────────────────────────────────
const QueueCard = ({
  appt, position, clientLabel, onArrived, onStart, onComplete, isLoading,
}: {
  appt:        Appointment;
  position?:   number;
  clientLabel: string;
  onArrived?:  () => void;
  onStart?:    () => void;
  onComplete?: () => void;
  isLoading?:  boolean;
}) => (
  <div className="flex items-center gap-4 px-5 py-4">
    {/* Número en fila */}
    {position != null && (
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
        {position}
      </div>
    )}

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="font-medium text-gray-900 truncate">
        {appt.client?.name ?? `${clientLabel} #${appt.clientId}`}
      </div>
      <div className="text-xs text-gray-400 mt-0.5">
        {appt.startTime} · {appt.service?.name}
        {appt.arrivedAt && (
          <span className="ml-2 text-green-600">
            · Llegó {new Date(appt.arrivedAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>

    <StatusBadge status={appt.status} />

    {/* Acciones */}
    <div className="flex gap-2 flex-shrink-0">
      {onArrived && (
        <button
          onClick={onArrived}
          disabled={isLoading}
          className="btn-secondary text-xs py-1.5 px-3"
        >
          {isLoading ? <Spinner size="sm" /> : "Llegó ✓"}
        </button>
      )}
      {onStart && (
        <button
          onClick={onStart}
          disabled={isLoading}
          className="btn-primary text-xs py-1.5 px-3"
        >
          {isLoading ? <Spinner size="sm" /> : "Iniciar →"}
        </button>
      )}
      {onComplete && (
        <button
          onClick={onComplete}
          disabled={isLoading}
          className="btn-secondary text-xs py-1.5 px-3 text-green-700 border-green-200 hover:bg-green-50"
        >
          {isLoading ? <Spinner size="sm" /> : "Completar ✓"}
        </button>
      )}
    </div>
  </div>
);
