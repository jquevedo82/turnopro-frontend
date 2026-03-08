import type { Appointment, Professional } from "@/types";
import { formatDate } from "@/utils/dates";

interface Props { appointment: Appointment; professional: Professional; onNew: () => void }

export const BookingSuccess = ({ appointment, professional, onNew }: Props) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-4">
    <div className="max-w-md w-full text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="font-display text-2xl text-emerald-700 mb-2">¡Cita solicitada!</h1>
      <p className="text-gray-500 text-sm mb-6">
        {appointment.status === "pending"
          ? "Tu solicitud fue recibida. El profesional la confirmará a la brevedad."
          : "Te llegó un email con todos los detalles y un link para gestionar tu cita."}
      </p>
      <div className="bg-white rounded-xl border border-gray-200 p-5 text-left space-y-3 shadow-sm mb-6">
        {[
          { icon: "🩺", label: "Servicio",    val: appointment.service?.name },
          { icon: "📅", label: "Fecha",       val: formatDate(appointment.date) },
          { icon: "⏰", label: "Hora",        val: `${appointment.startTime}hs` },
          { icon: "👨‍⚕️", label: "Profesional", val: professional.name },
        ].map(({ icon, label, val }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-base flex-shrink-0">{icon}</div>
            <div>
              <div className="text-xs text-gray-400 uppercase font-semibold tracking-wide">{label}</div>
              <div className="text-sm font-medium text-gray-800 mt-0.5">{val}</div>
            </div>
          </div>
        ))}
      </div>
      {/* WhatsApp al profesional */}
      {(professional.whatsappPhone || professional.phone) && (
        <a
          href={`https://wa.me/${(professional.whatsappPhone || professional.phone).replace(/[^0-9+]/g, "")}?text=${encodeURIComponent(
            `Hola ${professional.name}, reservé una cita para el ${appointment.date} a las ${appointment.startTime?.substring(0,5)}hs.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white mb-3"
          style={{ background: "#25d366" }}
        >
          💬 Escribir al profesional por WhatsApp
        </a>
      )}
      <button onClick={onNew} className="btn btn-outline w-full">Reservar otra cita</button>
    </div>
  </div>
);