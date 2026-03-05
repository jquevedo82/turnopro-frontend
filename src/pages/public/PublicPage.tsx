/**
 * PublicPage.tsx — Página pública del profesional.
 * Accesible en: /:slug  (ej: tudominio.com/dr-garcia)
 * Flujo: servicio → fecha → horario → datos → confirmación
 */
import { useState } from "react";
import { useParams } from "react-router-dom";
import { usePublicProfile, usePublicServices } from "@/hooks/usePublic";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useAvailableDays, useSlots } from "@/hooks/useAvailability";
import { PageLoader } from "@/components/ui/Spinner";
import { ServiceSelector } from "./components/ServiceSelector";
import { BookingCalendar } from "./components/BookingCalendar";
import { SlotPicker } from "./components/SlotPicker";
import { BookingForm } from "./components/BookingForm";
import { BookingSuccess } from "./components/BookingSuccess";
import type { Service, Appointment } from "@/types";

export const PublicPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: professional, isLoading, error } = usePublicProfile(slug);
  const { data: services = [] } = usePublicServices(slug);

  const [step, setStep]         = useState(1);
  const [service, setService]   = useState<Service | null>(null);
  const [date, setDate]         = useState<string>("");
  const [slot, setSlot]         = useState<string>("");
  const [expanded, setExpanded] = useState(false);
  const [created, setCreated]   = useState<Appointment | null>(null);

  const now     = new Date();
  const [calYear, setCalYear]   = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);

  const { data: availableDays = [] } = useAvailableDays(
    professional?.id ?? 0, calYear, calMonth
  );
  const { data: slots = [], isFetching: loadingSlots } = useSlots(
    professional?.id ?? 0, date, service?.id
  );

  const createAppt = useCreateAppointment();

  const handleBook = async (form: { name: string; email: string; phone: string; notes?: string }) => {
    if (!professional || !service || !date || !slot) return;
    const appt = await createAppt.mutateAsync({
      professionalId: professional.id,
      serviceId:      service.id,
      date, startTime: slot,
      clientName:  form.name,
      clientEmail: form.email,
      clientPhone: form.phone,
      notes:       form.notes,
    });
    setCreated(appt);
  };

  if (isLoading) return <PageLoader />;
  if (error || !professional) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="font-display text-xl text-gray-600">Profesional no encontrado</p>
        <p className="text-sm mt-2">Verificá el link que recibiste</p>
      </div>
    </div>
  );

  if (created) return <BookingSuccess appointment={created} professional={professional} onNew={() => { setCreated(null); setStep(1); setService(null); setDate(""); setSlot(""); }} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0f2342 0%, #1a3a6b 100%)" }} className="text-white px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-5 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-2xl font-bold border-2 border-white/30 flex-shrink-0">
              {professional.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{professional.name}</h1>
              <p className="text-blue-300 text-sm mt-0.5">{professional.profession}</p>
            </div>
          </div>
          {professional.slogan && <p className="text-white/70 italic text-sm mb-3">✦ {professional.slogan}</p>}
          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            {professional.address && <span>📍 {professional.address}</span>}
            {professional.phone   && <span>📞 {professional.phone}</span>}
          </div>
          <button onClick={() => setExpanded(!expanded)}
            className="mt-4 text-xs bg-white/10 border border-white/20 text-white/80 px-4 py-1.5 rounded-full hover:bg-white/20 transition-all">
            {expanded ? "▲ Ocultar info" : "▼ Ver más información"}
          </button>
          {expanded && professional.bio && (
            <div className="mt-3 bg-white/8 border border-white/10 rounded-xl p-4 text-sm text-white/80 leading-relaxed">
              {professional.bio}
            </div>
          )}
        </div>
      </div>

      {/* Booking area */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Paso 1 */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Paso 1 — Elegí tu servicio</p>
          <ServiceSelector services={services} selected={service} onSelect={(s) => { setService(s); setDate(""); setSlot(""); setStep(2); }} />
        </section>

        {/* Paso 2 */}
        {step >= 2 && service && (
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Paso 2 — Elegí una fecha</p>
            <BookingCalendar
              year={calYear} month={calMonth}
              availableDays={availableDays}
              selected={date}
              onSelect={(d) => { setDate(d); setSlot(""); setStep(3); }}
              onPrev={() => { if (calMonth === 1) { setCalYear(y => y-1); setCalMonth(12); } else setCalMonth(m => m-1); }}
              onNext={() => { if (calMonth === 12) { setCalYear(y => y+1); setCalMonth(1); } else setCalMonth(m => m+1); }}
            />
          </section>
        )}

        {/* Paso 3 */}
        {step >= 3 && date && (
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Paso 3 — Elegí un horario</p>
            <SlotPicker slots={slots} selected={slot} loading={loadingSlots} onSelect={(s) => { setSlot(s); setStep(4); }} />
          </section>
        )}

        {/* Paso 4 */}
        {step >= 4 && slot && (
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Paso 4 — Tus datos</p>
            <BookingForm
              service={service!} date={date} slot={slot}
              onSubmit={handleBook}
              loading={createAppt.isPending}
              error={createAppt.error?.message}
            />
          </section>
        )}
      </div>
    </div>
  );
};
