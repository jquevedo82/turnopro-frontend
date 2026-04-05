/**
 * SecretaryDashboardPage.tsx
 * Agenda del profesional activo — vista principal de la secretaria.
 *
 * Igual que DashboardPage del profesional pero:
 *   - Usa hooks *ForProfessional que pasan professionalId como query param
 *   - Sin botón "Compartir página"
 *   - Nueva cita → /secretaria/nueva-cita
 */
import { useState }    from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useActiveProfessional } from "@/store/auth.store";
import {
  useTodayForProfessional,
  useCancelForProfessional,
  useCompleteForProfessional,
  useConfirmForProfessional,
} from "@/hooks/useAppointments";
import { StatusBadge }              from "@/components/ui/Badge";
import { PageLoader, Spinner }      from "@/components/ui/Spinner";
import { formatDate, today }        from "@/utils/dates";
import { appointmentsApi }          from "@/api/appointments.api";
import { professionalsApi }         from "@/api/professionals.api";
import toast                        from "@/utils/toast";
import type { Appointment }         from "@/types";
import { isValidEmail, isValidPhone } from "@/utils/validation";

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
export const SecretaryDashboardPage = () => {
  const [date, setDate]      = useState(today());
  const activeProfessionalId = useAuthStore((s) => s.activeProfessionalId);
  const activeProfessional   = useActiveProfessional();
  const navigate             = useNavigate();

  const { data: appointments = [], isLoading } = useTodayForProfessional(activeProfessionalId, date);

  // Mutaciones con professionalId del contexto activo
  const cancelAppt   = useCancelForProfessional(activeProfessionalId);
  const completeAppt = useCompleteForProfessional(activeProfessionalId);
  const confirmAppt  = useConfirmForProfessional(activeProfessionalId);

  const [shareMenuOpen, setShareMenuOpen]   = useState(false);
  const [shareEmailModal, setShareEmailModal] = useState(false);
  const [shareWAModal, setShareWAModal]       = useState(false);
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  const stats = {
    total:     appointments.filter((a) => !["cancelled","expired"].includes(a.status)).length,
    confirmed: appointments.filter((a) => ["confirmed","reconfirmed"].includes(a.status)).length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    pending:   appointments.filter((a) => a.status === "pending").length,
  };

  if (!activeProfessionalId) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p className="text-4xl mb-3">👆</p>
        <p className="font-medium text-gray-600">Seleccioná un profesional para ver su agenda</p>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="section-hd">
        <div>
          <h1 className="page-title">📅 Agenda de hoy</h1>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(date)}</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="form-input text-sm hidden sm:block" style={{ width: "auto", minHeight: 40 }} />
          <button onClick={() => navigate("/secretaria/nueva-cita")} className="btn btn-primary btn-sm">
            + Nueva cita
          </button>
          {activeProfessional?.slug && (
            <div className="relative">
              <button onClick={() => setShareMenuOpen(!shareMenuOpen)} className="btn btn-outline btn-sm">
                🔗 <span className="hidden sm:inline">Compartir</span>
              </button>
              {shareMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShareMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                    <p className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                      Enviar link de turnos
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
                      <p className="text-xs text-gray-400 break-all">{appUrl}/{activeProfessional.slug}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fecha mobile */}
      <div className="sm:hidden mb-4">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input text-sm w-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total",       value: stats.total,     color: "text-gray-900"  },
          { label: "Confirmadas", value: stats.confirmed, color: "text-blue-600"  },
          { label: "Pendientes",  value: stats.pending,   color: "text-amber-600" },
          { label: "Canceladas",  value: stats.cancelled, color: "text-red-500"   },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Lista de citas */}
      {isLoading ? <PageLoader /> : (
        <div className="card">
          {appointments.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-medium text-sm">
                No hay citas para {activeProfessional?.name} este día
              </p>
            </div>
          ) : (
            appointments.map((appt) => (
              <AppointmentRow
                key={appt.id}
                appt={appt}
                professionalId={activeProfessionalId}
                isPending={confirmAppt.isPending || cancelAppt.isPending || completeAppt.isPending}
                onConfirm={() => { if (window.confirm(`¿Confirmar la cita de ${appt.client?.name}?`)) confirmAppt.mutate(appt.id); }}
                onCancel={()  => { if (window.confirm(`¿Cancelar la cita de ${appt.client?.name}? No se puede deshacer.`)) cancelAppt.mutate(appt.id); }}
                onComplete={() => { if (window.confirm(`¿Marcar como completada la cita de ${appt.client?.name}?`)) completeAppt.mutate(appt.id); }}
              />
            ))
          )}
        </div>
      )}

      {/* Modales compartir página del profesional */}
      {shareEmailModal && activeProfessional && activeProfessionalId && (
        <SharePageEmailModal
          professionalName={activeProfessional.name}
          professionalId={activeProfessionalId}
          onClose={() => setShareEmailModal(false)}
        />
      )}
      {shareWAModal && activeProfessional && (
        <SharePageWAModal
          professionalName={activeProfessional.name}
          slug={activeProfessional.slug}
          appUrl={appUrl}
          onClose={() => setShareWAModal(false)}
        />
      )}
    </div>
  );
};

// ── Modal: compartir página por email (secretaria) ────────────────────────────
const SharePageEmailModal = ({
  professionalName, professionalId, onClose,
}: { professionalName: string; professionalId: number; onClose: () => void }) => {
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSend = async () => {
    if (!isValidEmail(email)) { setError("Ingresá un email válido"); return; }
    setError(""); setLoading(true);
    try {
      await professionalsApi.shareLinkForProfessional(email, professionalId);
      setSent(true);
      setTimeout(onClose, 2000);
    } catch {
      setError("No se pudo enviar. Verificá la configuración de email.");
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
          <p className="text-sm text-gray-500">
            Enviá el link de reservas de <strong>{professionalName}</strong>
          </p>
          <div>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="form-input" placeholder="paciente@email.com" autoFocus />
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

// ── Modal: compartir página por WhatsApp (secretaria) ─────────────────────────
const SharePageWAModal = ({
  professionalName, slug, appUrl, onClose,
}: { professionalName: string; slug: string; appUrl: string; onClose: () => void }) => {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSend = () => {
    if (!phone.trim()) { setError("Ingresá un número"); return; }
    const clean = phone.replace(/\s/g, "");
    const text  = encodeURIComponent(
      `Hola! 👋 Te comparto el link para reservar tu turno online con *${professionalName}*:\n\n${appUrl}/${slug}\n\nRápido y sin llamadas 🗓️`
    );
    window.open(`https://wa.me/${clean}?text=${text}`, "_blank");
    onClose();
  };

  return (
    <Modal title="💬 Enviar link por WhatsApp" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-gray-500">
          Enviá el link de <strong>{professionalName}</strong> por WhatsApp
        </p>
        <div>
          <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="form-input" placeholder="+54 9 11 1234-5678" autoFocus />
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
const AppointmentRow = ({
  appt, professionalId, isPending, onConfirm, onCancel, onComplete,
}: {
  appt: Appointment; professionalId: number;
  isPending: boolean;
  onConfirm: () => void; onCancel: () => void; onComplete: () => void;
}) => {
  const [resendOpen,       setResendOpen]       = useState(false);
  const [resendEmailModal, setResendEmailModal] = useState(false);
  const [resendWAModal,    setResendWAModal]    = useState(false);
  const isDone = ["cancelled","expired","completed","no_show"].includes(appt.status);
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  return (
    <>
      <div className="px-4 py-3.5 border-b border-gray-100 last:border-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-display text-base font-bold flex-shrink-0" style={{ color: "#0f2342" }}>
              {appt.startTime?.substring(0,5)}
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
            {["confirmed","reconfirmed"].includes(appt.status) && (
              <>
                <button onClick={onComplete} disabled={isPending} className="btn btn-xs btn-success disabled:opacity-50">{isPending ? "..." : "✓ Listo"}</button>
                <button onClick={onCancel}   disabled={isPending} className="btn btn-xs btn-danger  disabled:opacity-50">{isPending ? "..." : "✕"}</button>
              </>
            )}
            {appt.status === "pending" && (
              <>
                <button onClick={onConfirm} disabled={isPending} className="btn btn-xs btn-success disabled:opacity-50">{isPending ? "..." : "✓ Aceptar"}</button>
                <button onClick={onCancel}  disabled={isPending} className="btn btn-xs btn-danger  disabled:opacity-50">{isPending ? "..." : "✕"}</button>
              </>
            )}
            {!isDone && (
              <button onClick={() => setResendOpen(!resendOpen)}
                className={`btn btn-xs btn-outline ${resendOpen ? "bg-gray-100" : ""}`}
                title="Reenviar al paciente">
                📤
              </button>
            )}
          </div>
        </div>

        {resendOpen && (
          <div className="mt-2 ml-10 flex gap-2 flex-wrap">
            <button onClick={() => { setResendOpen(false); setResendEmailModal(true); }} className="btn btn-xs btn-outline">
              📧 Reenviar Email
            </button>
            <button onClick={() => { setResendOpen(false); setResendWAModal(true); }} className="btn btn-xs btn-outline">
              💬 Reenviar WhatsApp
            </button>
          </div>
        )}
      </div>

      {resendEmailModal && (
        <ResendEmailModal appt={appt} professionalId={professionalId} onClose={() => setResendEmailModal(false)} />
      )}
      {resendWAModal && (
        <ResendWAModal appt={appt} appUrl={appUrl} onClose={() => setResendWAModal(false)} />
      )}
    </>
  );
};

// ── Modal reenviar email ──────────────────────────────────────────────────────
const ResendEmailModal = ({ appt, professionalId, onClose }: { appt: Appointment; professionalId: number; onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSend = async () => {
    setLoading(true);
    try {
      await appointmentsApi.sendReminderForProfessional(appt.id, professionalId);
      setSent(true);
      setTimeout(onClose, 2000);
    } catch {
      setError("No se pudo enviar el email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="📧 Reenviar email al paciente" onClose={onClose}>
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
            <p className="text-xs text-gray-400">📅 {appt.date} a las {appt.startTime?.substring(0,5)}hs</p>
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

// ── Modal reenviar WhatsApp ───────────────────────────────────────────────────
const ResendWAModal = ({ appt, appUrl, onClose }: { appt: Appointment; appUrl: string; onClose: () => void }) => {
  const [phone, setPhone] = useState(appt.client?.phone ?? "");
  const [error, setError] = useState("");

  const handleSend = () => {
    if (!isValidPhone(phone)) { setError("Ingresá un número válido con código de país. Ej: +5491112345678"); return; }
    const clean = phone.replace(/\s/g, "");
    const text  = encodeURIComponent(
      `Hola ${appt.client?.name}! 👋\n\n` +
      `Te recordamos tu cita:\n` +
      `📅 *${appt.date}* a las *${appt.startTime?.substring(0,5)}hs*\n` +
      `🩺 ${appt.service?.name}\n\n` +
      `Ver y gestionar tu cita: ${appUrl}/cita/${appt.token}`
    );
    window.open(`https://wa.me/${clean}?text=${text}`, "_blank");
    onClose();
  };

  return (
    <Modal title="💬 Reenviar WhatsApp al paciente" onClose={onClose}>
      <div className="space-y-3">
        <div className="bg-gray-50 rounded-xl p-4 space-y-1">
          <p className="text-sm font-medium text-gray-700">{appt.client?.name}</p>
          <p className="text-xs text-gray-400">📅 {appt.date} a las {appt.startTime?.substring(0,5)}hs</p>
        </div>
        <div>
          <label className="form-label">Número de WhatsApp</label>
          <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="form-input" placeholder="+54 9 11 1234-5678" autoFocus />
          {error && <p className="form-error">{error}</p>}
          <p className="text-xs text-gray-400 mt-1">Pre-cargado con el número del paciente. Podés editarlo.</p>
        </div>
        <button onClick={handleSend} disabled={!phone} className="btn btn-success btn-full">
          💬 Abrir WhatsApp
        </button>
      </div>
    </Modal>
  );
};
