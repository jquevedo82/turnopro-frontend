/**
 * SecretaryQueuePage.tsx — Panel de sala de espera para la secretaria.
 * Opera en nombre del profesional activo seleccionado en el contexto de secretaria.
 */
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  useQueueForProfessional,
  useMarkArrivedForProfessional,
  useStartConsultationForProfessional,
  useCompleteForProfessional,
} from "@/hooks/useAppointments";
import { StatusBadge } from "@/components/ui/Badge";
import { PageLoader, Spinner } from "@/components/ui/Spinner";
import { today } from "@/utils/dates";
import type { Appointment } from "@/types";

const STATUS_ORDER: Record<string, number> = {
  in_progress: 0,
  arrived:     1,
  confirmed:   2,
  reconfirmed: 2,
  completed:   3,
};

export const SecretaryQueuePage = () => {
  const activeProfessionalId = useAuthStore((s) => s.activeProfessionalId);
  const activeProfessionals  = useAuthStore((s) => s.user?.professionals ?? []);
  const activeProfessional   = activeProfessionals.find((p) => p.id === activeProfessionalId);
  const [date]               = useState(today());

  const { data: queue = [], isLoading } = useQueueForProfessional(activeProfessionalId, date);
  const markArrived       = useMarkArrivedForProfessional(activeProfessionalId);
  const startConsultation = useStartConsultationForProfessional(activeProfessionalId);
  const completeAppt      = useCompleteForProfessional(activeProfessionalId);

  const sorted = [...queue].sort((a, b) => {
    const oa = STATUS_ORDER[a.status] ?? 9;
    const ob = STATUS_ORDER[b.status] ?? 9;
    if (oa !== ob) return oa - ob;
    if (a.arrivedAt && b.arrivedAt) return new Date(a.arrivedAt).getTime() - new Date(b.arrivedAt).getTime();
    return a.startTime.localeCompare(b.startTime);
  });

  const inProgress = sorted.filter((a) => a.status === "in_progress");
  const waiting    = sorted.filter((a) => a.status === "arrived");
  const upcoming   = sorted.filter((a) => ["confirmed", "reconfirmed"].includes(a.status));
  const done       = sorted.filter((a) => a.status === "completed");

  const publicSlug = activeProfessional?.slug;
  const publicUrl  = publicSlug ? `${window.location.origin}/sala/${publicSlug}` : null;

  if (!activeProfessionalId) {
    return (
      <div className="page">
        <div className="card py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">🪑</div>
          <p>Seleccioná un profesional para ver la sala de espera</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="page">
      <div className="section-hd">
        <div>
          <h1 className="page-title">🪑 Sala de espera</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {activeProfessional?.name} · {date} · {queue.length} pacientes
          </p>
        </div>
        {publicUrl && (
          <a href={publicUrl} target="_blank" rel="noreferrer" className="btn-secondary text-sm">
            📺 Ver pantalla TV
          </a>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="card py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">🪑</div>
          <p>No hay pacientes confirmados para hoy</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inProgress.length > 0 && (
            <QueueSection title="En consulta ahora" colorClass="border-green-200 bg-green-50">
              {inProgress.map((appt) => (
                <QueueRow key={appt.id} appt={appt}
                  onComplete={() => completeAppt.mutate(appt.id)}
                  isLoading={completeAppt.isPending} />
              ))}
            </QueueSection>
          )}
          {waiting.length > 0 && (
            <QueueSection title={`Esperando (${waiting.length})`} colorClass="border-blue-200 bg-blue-50">
              {waiting.map((appt, idx) => (
                <QueueRow key={appt.id} appt={appt} position={idx + 1}
                  onStart={() => startConsultation.mutate(appt.id)}
                  onComplete={() => completeAppt.mutate(appt.id)}
                  isLoading={startConsultation.isPending || completeAppt.isPending} />
              ))}
            </QueueSection>
          )}
          {upcoming.length > 0 && (
            <QueueSection title="Confirmados — no llegaron aún" colorClass="border-gray-200 bg-white">
              {upcoming.map((appt) => (
                <QueueRow key={appt.id} appt={appt}
                  onArrived={() => markArrived.mutate(appt.id)}
                  isLoading={markArrived.isPending} />
              ))}
            </QueueSection>
          )}
          {done.length > 0 && (
            <QueueSection title={`Completados (${done.length})`} colorClass="border-gray-200 bg-white" collapsed>
              {done.map((appt) => (
                <QueueRow key={appt.id} appt={appt} />
              ))}
            </QueueSection>
          )}
        </div>
      )}
    </div>
  );
};

// ── Sub-componentes ───────────────────────────────────────────────────────────

const QueueSection = ({
  title, colorClass, collapsed = false, children,
}: { title: string; colorClass: string; collapsed?: boolean; children: React.ReactNode }) => {
  const [open, setOpen] = useState(!collapsed);
  return (
    <div className={`card border ${colorClass}`}>
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

const QueueRow = ({
  appt, position, onArrived, onStart, onComplete, isLoading,
}: {
  appt:        Appointment;
  position?:   number;
  onArrived?:  () => void;
  onStart?:    () => void;
  onComplete?: () => void;
  isLoading?:  boolean;
}) => (
  <div className="flex items-center gap-4 px-5 py-4">
    {position != null && (
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
        {position}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="font-medium text-gray-900 truncate">{appt.client?.name ?? `Paciente #${appt.clientId}`}</div>
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
    <div className="flex gap-2 flex-shrink-0">
      {onArrived && (
        <button onClick={onArrived} disabled={isLoading} className="btn-secondary text-xs py-1.5 px-3">
          {isLoading ? <Spinner size="sm" /> : "Llegó ✓"}
        </button>
      )}
      {onStart && (
        <button onClick={onStart} disabled={isLoading} className="btn-primary text-xs py-1.5 px-3">
          {isLoading ? <Spinner size="sm" /> : "Iniciar ��"}
        </button>
      )}
      {onComplete && (
        <button onClick={onComplete} disabled={isLoading} className="btn-secondary text-xs py-1.5 px-3 text-green-700 border-green-200 hover:bg-green-50">
          {isLoading ? <Spinner size="sm" /> : "Completar ✓"}
        </button>
      )}
    </div>
  </div>
);
