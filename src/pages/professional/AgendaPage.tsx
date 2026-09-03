/**
 * AgendaPage.tsx — Reemplaza DashboardPage (Hoy), TomorrowPage (Mañana) y
 * PendingPage (Pendientes), que eran tres pantallas separadas resolviendo
 * en realidad dos ejes distintos (fecha y estado) de forma inconsistente:
 * "Mañana" era solo un caso particular de "Hoy" con el selector en +1 día,
 * y "Pendientes" cortaba por estado en vez de por fecha. Mismo patrón que
 * usan Calendly/Booksy/Fresha/Doctoralia: una sola agenda con navegador de
 * fecha + filtro de estado, más un modo aparte para ver pendientes de
 * cualquier fecha sin tener que ir día por día.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useToday, useUpcoming, useMarkReminder,
  useCancelAppointment, useCompleteAppointment, useConfirmAppointment,
} from "@/hooks/useAppointments";
import { StatusBadge } from "@/components/ui/Badge";
import { PageLoader, Spinner } from "@/components/ui/Spinner";
import { formatDate, today, toYMD } from "@/utils/dates";
import { useAuthStore } from "@/store/auth.store";
import { appointmentsApi } from "@/api/appointments.api";
import { professionalsApi } from "@/api/professionals.api";
import toast from "@/utils/toast";
import type { Appointment, AppointmentStatus } from "@/types";
import { useVerticalConfig } from "@/hooks/useVerticalConfig";
import { isValidEmail, isValidPhone } from "@/utils/validation";
import { waUrl } from "@/utils/whatsapp";

type ViewMode = "day" | "upcoming";
type StatusFilter = "all" | "confirmed" | "pending" | "cancelled";
type UpcomingFilter = "all" | "pending" | "confirmed" | "reconfirmed" | "cancelled";

const UPCOMING_FILTERS: { key: UpcomingFilter; label: string }[] = [
  { key: "all",         label: "Todas" },
  { key: "pending",     label: "Pendientes" },
  { key: "confirmed",   label: "Confirmadas" },
  { key: "reconfirmed", label: "Reconfirmadas" },
  { key: "cancelled",   label: "Canceladas" },
];

// "martes 15/09/2026" — el nombre del día solo no alcanza cuando se listan citas
// de fechas distintas (vista "todas las fechas"), hace falta la fecha completa.
const formatDateWithWeekday = (dateStr: string): string => {
  const d = new Date(dateStr + "T12:00:00");
  const weekday = d.toLocaleDateString("es-ES", { weekday: "long" });
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${weekday} ${dd}/${mm}/${d.getFullYear()}`;
};

// ── Modal genérico ────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">✕</button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────────
export const AgendaPage = () => {
  const [viewMode, setViewMode]         = useState<ViewMode>("day");
  const [date, setDate]                 = useState(today());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [upcomingFilter, setUpcomingFilter] = useState<UpcomingFilter>("all");
  const { user }        = useAuthStore();
  const vc              = useVerticalConfig();
  const navigate         = useNavigate();

  const { data: dayAppointments = [], isLoading: loadingDay } = useToday(date);
  const {
    data: upcomingAppointments = [], isLoading: loadingUpcoming,
    isError: upcomingIsError, error: upcomingError, refetch: refetchUpcoming,
  } = useUpcoming(upcomingFilter === "all" ? undefined : upcomingFilter as AppointmentStatus);
  // Badge de "pendientes" en el botón del toggle — independiente del filtro que
  // esté activo ahora, para que siga avisando aunque estés mirando "Confirmadas".
  const { data: pendingBadge = [] } = useUpcoming("pending" as AppointmentStatus);

  const cancelAppt   = useCancelAppointment();
  const completeAppt = useCompleteAppointment();
  const confirmAppt  = useConfirmAppointment();

  const actionsPending = confirmAppt.isPending || cancelAppt.isPending || completeAppt.isPending;

  const stats = {
    total:     dayAppointments.filter((a) => !["cancelled", "expired"].includes(a.status)).length,
    confirmed: dayAppointments.filter((a) => ["confirmed", "reconfirmed"].includes(a.status)).length,
    pending:   dayAppointments.filter((a) => a.status === "pending").length,
    cancelled: dayAppointments.filter((a) => a.status === "cancelled").length,
  };

  const dayFiltered = statusFilter === "all" ? dayAppointments
    : statusFilter === "confirmed" ? dayAppointments.filter((a) => ["confirmed", "reconfirmed"].includes(a.status))
    : statusFilter === "pending"   ? dayAppointments.filter((a) => a.status === "pending")
    : dayAppointments.filter((a) => a.status === "cancelled");

  const visibleAppointments = viewMode === "upcoming" ? upcomingAppointments : dayFiltered;
  const isLoading           = viewMode === "upcoming" ? loadingUpcoming : loadingDay;

  const shiftDay = (deltaDays: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + deltaDays);
    setDate(toYMD(d));
  };

  // Modales de compartir página
  const [shareEmailModal, setShareEmailModal] = useState(false);
  const [shareWAModal, setShareWAModal]       = useState(false);
  const [shareMenuOpen, setShareMenuOpen]     = useState(false);
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  return (
    <div className="page">
      {/* Header */}
      <div className="section-hd">
        <div>
          <h1 className="page-title">📅 Agenda</h1>
          {viewMode === "day" && <p className="text-xs text-gray-400 mt-0.5">{formatDate(date)}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/panel/nueva-cita")} className="btn btn-primary btn-sm">
            + Nueva {vc.appointmentLabel.toLowerCase()}
          </button>
          <div className="relative">
            <button onClick={() => setShareMenuOpen(!shareMenuOpen)} className="btn btn-outline btn-sm">
              🔗 <span className="hidden sm:inline">Compartir página</span>
            </button>
            {shareMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShareMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                  <p className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    Enviar mi link de turnos
                  </p>
                  <button onClick={() => { setShareMenuOpen(false); setShareEmailModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                    📧 Enviar por Email
                  </button>
                  <button onClick={() => { setShareMenuOpen(false); setShareWAModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100">
                    💬 Enviar por WhatsApp
                  </button>
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-400 break-all">{appUrl}/{user?.slug}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toggle de vista: por día vs. todas las fechas (con filtro de estado propio) */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setViewMode("day")}
          className={`btn btn-sm ${viewMode === "day" ? "btn-primary" : "btn-outline"}`}>
          📅 Por día
        </button>
        <button onClick={() => setViewMode("upcoming")}
          className={`btn btn-sm ${viewMode === "upcoming" ? "btn-primary" : "btn-outline"}`}>
          🕓 Todas las fechas{pendingBadge.length > 0 ? ` · ${pendingBadge.length} pendientes` : ""}
        </button>
      </div>

      {viewMode === "day" && (
        <>
          {/* Navegador de fecha */}
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => shiftDay(-1)} className="btn btn-outline btn-sm" aria-label="Día anterior">‹</button>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="form-input text-sm" style={{ width: "auto", minHeight: 40 }} />
            <button onClick={() => shiftDay(1)} className="btn btn-outline btn-sm" aria-label="Día siguiente">›</button>
            {date !== today() && (
              <button onClick={() => setDate(today())} className="btn btn-outline btn-sm">Hoy</button>
            )}
          </div>

          {/* Chips de estado — clickeables, filtran la lista del día */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { key: "all" as const,       label: "Total",       value: stats.total,     color: "text-gray-900" },
              { key: "confirmed" as const, label: "Confirmadas", value: stats.confirmed, color: "text-blue-600" },
              { key: "pending" as const,   label: "Pendientes",  value: stats.pending,   color: "text-amber-600" },
              { key: "cancelled" as const, label: "Canceladas",  value: stats.cancelled, color: "text-red-500" },
            ].map((s) => (
              <button key={s.key} onClick={() => setStatusFilter(s.key)}
                className={`stat-card text-left transition-all ${statusFilter === s.key ? "ring-2 ring-blue-400" : ""}`}>
                <div className="stat-label">{s.label}</div>
                <div className={`stat-value ${s.color}`}>{s.value}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {viewMode === "upcoming" && (
        <>
          {/* Filtro de estado — mismo mecanismo que "Pendientes" pero para cualquiera:
              no hace falta recorrer el calendario día por día para saber, por ejemplo,
              cuáles ya están confirmadas. */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {UPCOMING_FILTERS.map((f) => (
              <button key={f.key} onClick={() => setUpcomingFilter(f.key)}
                className={`btn btn-xs ${upcomingFilter === f.key ? "btn-primary" : "btn-outline"}`}>
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-4">
            {UPCOMING_FILTERS.find((f) => f.key === upcomingFilter)?.label} de cualquier día, desde hoy — ordenadas por la más próxima
          </p>
        </>
      )}

      {/* Lista */}
      {isLoading ? <PageLoader /> : viewMode === "upcoming" && upcomingIsError ? (
        <div className="card py-12 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-gray-600 font-medium">No se pudieron cargar las citas</p>
          {upcomingError && <p className="text-xs text-gray-400 mt-1">{(upcomingError as any)?.response?.data?.message || (upcomingError as Error).message}</p>}
          <button onClick={() => refetchUpcoming()} className="btn btn-outline btn-sm mt-4">Reintentar</button>
        </div>
      ) : (
        <div className="card">
          {visibleAppointments.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <div className="text-4xl mb-3">{viewMode === "upcoming" ? "✨" : "📭"}</div>
              <p className="font-medium text-sm">
                {viewMode === "upcoming" ? "No hay citas que coincidan con este filtro" : "No hay citas para este día"}
              </p>
            </div>
          ) : (
            visibleAppointments.map((appt) => (
              <AppointmentRow key={appt.id} appt={appt}
                showDate={viewMode === "upcoming"}
                isPending={actionsPending}
                onConfirm={() => { if (window.confirm(`¿Confirmar la ${vc.appointmentLabel.toLowerCase()} de ${appt.client?.name}?`)) confirmAppt.mutate(appt.id); }}
                onCancel={()  => { if (window.confirm(`¿Cancelar la ${vc.appointmentLabel.toLowerCase()} de ${appt.client?.name}? No se puede deshacer.`)) cancelAppt.mutate(appt.id); }}
                onComplete={() => { if (window.confirm(`¿Marcar como completada la ${vc.appointmentLabel.toLowerCase()} de ${appt.client?.name}?`)) completeAppt.mutate(appt.id); }}
              />
            ))
          )}
        </div>
      )}

      {/* Modal compartir por email */}
      {shareEmailModal && user?.slug && (
        <ShareEmailModal
          professionalName={user.name ?? ""}
          onClose={() => setShareEmailModal(false)}
        />
      )}

      {/* Modal compartir por WhatsApp */}
      {shareWAModal && user?.slug && (
        <ShareWAModal
          professionalName={user.name ?? ""}
          slug={user.slug}
          appUrl={appUrl}
          onClose={() => setShareWAModal(false)}
        />
      )}
    </div>
  );
};

// ── Modal: compartir por email ────────────────────────────────────────────────
const ShareEmailModal = ({ professionalName, onClose }: { professionalName: string; onClose: () => void }) => {
  const { user }              = useAuthStore();
  const vc                    = useVerticalConfig(user?.professionalType);
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSend = async () => {
    if (!isValidEmail(email)) { setError("Ingresá un email válido"); return; }
    setError(""); setLoading(true);
    try {
      await professionalsApi.shareLink(email);
      setSent(true);
      setTimeout(onClose, 2000);
    } catch {
      setError("No se pudo enviar. Verificá la configuración de email en el .env");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="📧 Enviar link por Email" onClose={onClose}>
      {sent ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm text-emerald-600 font-medium">Email enviado a {email}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Ingresá el email al que querés enviar el link de reservas de <strong>{professionalName}</strong></p>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="form-input"
              placeholder={`${vc.clientLabel.toLowerCase()}@email.com`}
              autoFocus
            />
            {error && <p className="form-error">{error}</p>}
          </div>
          <button onClick={handleSend} disabled={loading || !email} className="btn btn-primary btn-full">
            {loading ? <><Spinner size="sm" /> Enviando...</> : "Enviar Email"}
          </button>
        </div>
      )}
    </Modal>
  );
};

// ── Modal: compartir por WhatsApp ─────────────────────────────────────────────
const ShareWAModal = ({ professionalName, slug, appUrl, onClose }: { professionalName: string; slug: string; appUrl: string; onClose: () => void }) => {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSend = () => {
    if (!isValidPhone(phone)) { setError("Ingresá un número válido con código de país. Ej: +5491112345678"); return; }
    const text = `Hola! 👋 Te comparto el link para reservar tu turno online con *${professionalName}*:\n\n${appUrl}/${slug}\n\nRápido y sin llamadas 🗓️`;
    window.open(waUrl(phone, text), "_blank");
    onClose();
  };

  return (
    <Modal title="💬 Enviar link por WhatsApp" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-gray-500">Ingresá el número de WhatsApp al que querés enviar el link de <strong>{professionalName}</strong></p>
        <div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="form-input"
            placeholder="+54 9 11 1234-5678"
            autoFocus
          />
          {error && <p className="form-error">{error}</p>}
        </div>
        <button onClick={handleSend} disabled={!phone} className="btn btn-success btn-full">
          💬 Abrir WhatsApp
        </button>
      </div>
    </Modal>
  );
};

// ── Fila de cita ──────────────────────────────────────────────────────────────
const AppointmentRow = ({ appt, showDate, isPending, onConfirm, onCancel, onComplete }: {
  appt:       Appointment;
  showDate:   boolean;
  isPending:  boolean;
  onConfirm:  () => void;
  onCancel:   () => void;
  onComplete: () => void;
}) => {
  const vc = useVerticalConfig();
  const { user } = useAuthStore();
  const markReminder = useMarkReminder();
  const [resendOpen, setResendOpen] = useState(false);
  const [resendEmailModal, setResendEmailModal] = useState(false);
  const isDone = ["cancelled", "expired", "completed", "no_show"].includes(appt.status);
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  const handleResendWA = () => {
    const phone = appt.client?.phone?.replace(/[^0-9+]/g, "") ?? "";
    const dateStr = formatDate(appt.date);
    const text =
      `Hola ${appt.client?.name}! 👋 Te recordamos tu ${vc.appointmentLabel.toLowerCase()}:\n\n` +
      `📅 ${dateStr}\n⏰ ${appt.startTime?.substring(0, 5)}hs\n👨‍⚕️ ${user?.name}\n\n` +
      `¿Vas a asistir?\n\n` +
      `✅ Confirmar → ${appUrl}/cita/${appt.token}/reconfirmar\n` +
      `❌ Cancelar  → ${appUrl}/cita/${appt.token}/cancelar`;
    window.open(waUrl(phone, text), "_blank");
    markReminder.mutate(appt.id);
    setResendOpen(false);
  };

  return (
    <>
      <div className="px-4 py-3.5 border-b border-gray-100 last:border-0">
        {showDate && (
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1.5 capitalize">
            {formatDateWithWeekday(appt.date)}
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-display text-base font-bold flex-shrink-0" style={{ color: "#0f2342" }}>
              {appt.startTime?.substring(0, 5)}
            </span>
            <div className="min-w-0">
              <div className="font-semibold text-sm text-gray-900 truncate">{appt.client?.name}</div>
              {appt.service?.name && (
                <div className="text-xs text-gray-400 truncate">
                  🩺 {appt.service.name}
                  {appt.service.durationMinutes && (
                    <span className="text-gray-300"> · {appt.service.durationMinutes} min</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <StatusBadge status={appt.status} />
        </div>

        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="text-xs text-gray-400 truncate">📱 {appt.client?.phone}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {["confirmed", "reconfirmed"].includes(appt.status) && (
              <>
                <button onClick={onComplete} disabled={isPending} className="btn btn-xs btn-success disabled:opacity-50 disabled:cursor-not-allowed">{isPending ? "..." : "✓ Listo"}</button>
                <button onClick={onCancel}   disabled={isPending} className="btn btn-xs btn-danger  disabled:opacity-50 disabled:cursor-not-allowed">{isPending ? "..." : "✕"}</button>
              </>
            )}
            {appt.status === "pending" && (
              <>
                <button onClick={onConfirm} disabled={isPending} className="btn btn-xs btn-success disabled:opacity-50 disabled:cursor-not-allowed">{isPending ? "..." : "✓ Aceptar"}</button>
                <button onClick={onCancel}  disabled={isPending} className="btn btn-xs btn-danger  disabled:opacity-50 disabled:cursor-not-allowed">{isPending ? "..." : "✕"}</button>
              </>
            )}
            {!isDone && (
              <button onClick={() => setResendOpen(!resendOpen)}
                className={`btn btn-xs btn-outline ${resendOpen ? "bg-gray-100" : ""}`}
                title={`Reenviar recordatorio al ${vc.clientLabel.toLowerCase()}`}>
                📤
              </button>
            )}
          </div>
        </div>

        {resendOpen && (
          <div className="mt-2 ml-10 flex gap-2 flex-wrap items-center">
            <button onClick={() => { setResendOpen(false); setResendEmailModal(true); }} className="btn btn-xs btn-outline">
              📧 Reenviar Email
            </button>
            <button onClick={handleResendWA} className="btn btn-xs btn-wa">
              💬 Reenviar WhatsApp
            </button>
            {appt.reminderSent && <span className="text-xs text-teal-600">✓ Enviado</span>}
          </div>
        )}
      </div>

      {resendEmailModal && (
        <ResendEmailModal appt={appt} onClose={() => setResendEmailModal(false)} />
      )}
    </>
  );
};

// ── Modal: reenviar confirmación al paciente por email ────────────────────────
const ResendEmailModal = ({ appt, onClose }: { appt: Appointment; onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const vc = useVerticalConfig();

  const handleSend = async () => {
    setLoading(true);
    try {
      await appointmentsApi.sendReminder(appt.id);
      setSent(true);
      setTimeout(onClose, 2000);
    } catch {
      setError("No se pudo enviar el email. Verificá la configuración SMTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`📧 Reenviar email al ${vc.clientLabel.toLowerCase()}`} onClose={onClose}>
      {sent ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm text-emerald-600 font-medium">Email enviado a {appt.client?.email}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-xl p-4 space-y-1">
            <p className="text-sm font-medium text-gray-700">{appt.client?.name}</p>
            <p className="text-xs text-gray-400">📧 {appt.client?.email}</p>
            <p className="text-xs text-gray-400">📅 {appt.date} a las {appt.startTime?.substring(0, 5)}hs</p>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button onClick={handleSend} disabled={loading} className="btn btn-primary btn-full">
            {loading ? <><Spinner size="sm" /> Enviando...</> : "Enviar Email"}
          </button>
        </div>
      )}
    </Modal>
  );
};
