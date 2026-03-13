/**
 * PublicPage.tsx — Mobile-first. Flujo 4 pasos con indicador sticky.
 */
import { useState } from "react";
import { useParams } from "react-router-dom";
import { usePublicProfile, usePublicServices } from "@/hooks/usePublic";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useAvailableDays, useSlots } from "@/hooks/useAvailability";
import { PageLoader } from "@/components/ui/Spinner";
import { ServiceSelector } from "./components/ServiceSelector";
import { BookingCalendar }  from "./components/BookingCalendar";
import { SlotPicker }       from "./components/SlotPicker";
import { BookingForm }      from "./components/BookingForm";
import { BookingSuccess }   from "./components/BookingSuccess";
import type { Service, Appointment } from "@/types";

const STEPS = ["Servicio", "Fecha", "Horario", "Datos"];

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

  const now = new Date();
  const [calYear, setCalYear]   = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);

  // ── Cambio: se pasa service?.id para que los días disponibles
  //    se recalculen según la duración del servicio elegido
  const { data: availableDays = [] } = useAvailableDays(
    professional?.id ?? 0,
    calYear,
    calMonth,
    service?.id,        // ← nuevo parámetro
  );

  const { data: slots = [], isFetching: loadingSlots } = useSlots(
    professional?.id ?? 0,
    date,
    service?.id,
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
    <div className="min-h-screen flex items-center justify-center p-6 text-gray-400">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="font-display text-xl text-gray-600">Profesional no encontrado</p>
        <p className="text-sm mt-2">Verificá el link que recibiste</p>
      </div>
    </div>
  );

  if (created) return (
    <BookingSuccess appointment={created} professional={professional}
      onNew={() => { setCreated(null); setStep(1); setService(null); setDate(""); setSlot(""); }} />
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0f2342 0%, #1a3a6b 100%)" }} className="text-white px-4 py-8 sm:py-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-[168px] h-[168px] sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-4xl sm:text-5xl font-bold border-2 border-white/30 flex-shrink-0 overflow-hidden">
              {professional.avatar
                ? <img src={professional.avatar} alt={professional.name} className="w-full h-full object-cover" />
                : professional.name.charAt(0)
              }
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-xl sm:text-2xl font-bold leading-tight">{professional.name}</h1>
              <p className="text-blue-300 text-sm mt-0.5">{professional.profession}</p>
            </div>
          </div>
          {professional.slogan && (
            <p className="text-white/70 italic text-sm mb-3">✦ {professional.slogan}</p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-white/70">
            {professional.address && <span>📍 {professional.address}</span>}
            {professional.phone   && <a href={`tel:${professional.phone}`} className="hover:text-white">📞 {professional.phone}</a>}
          </div>
          {professional.bio && (
            <>
              <button onClick={() => setExpanded(!expanded)}
                className="mt-3 text-xs bg-white/10 border border-white/20 text-white/80 px-4 py-1.5 rounded-full">
                {expanded ? "▲ Ocultar" : "▼ Ver más"}
              </button>
              {expanded && (
                <div className="mt-3 bg-white/10 rounded-xl p-4 text-sm text-white/80 leading-relaxed">
                  {professional.bio}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Steps indicator */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-1">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done    = step > n;
            const current = step === n;
            return (
              <div key={n} className="flex items-center gap-1 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  done    ? "bg-blue-600 text-white" :
                  current ? "bg-blue-600 text-white ring-2 ring-blue-200" :
                            "bg-gray-100 text-gray-400"
                }`}>
                  {done ? "✓" : n}
                </div>
                <span className={`text-xs hidden sm:inline ${current ? "text-blue-600 font-semibold" : done ? "text-gray-500" : "text-gray-300"}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded ${step > n ? "bg-blue-600" : "bg-gray-100"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking area */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">

        {/* Paso 1 */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Elegí tu servicio</h2>
          <ServiceSelector services={services} selected={service}
            onSelect={(s) => { setService(s); setDate(""); setSlot(""); setStep(2); }} />
        </section>

        {/* Paso 2 */}
        {step >= 2 && service && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Elegí una fecha</h2>
              <button onClick={() => { setStep(1); setService(null); setDate(""); setSlot(""); }}
                className="text-xs text-gray-400 underline">Cambiar servicio</button>
            </div>
            <BookingCalendar
              year={calYear} month={calMonth}
              availableDays={availableDays} selected={date}
              onSelect={(d) => { setDate(d); setSlot(""); setStep(3); }}
              onPrev={() => { if (calMonth === 1) { setCalYear(y => y-1); setCalMonth(12); } else setCalMonth(m => m-1); }}
              onNext={() => { if (calMonth === 12) { setCalYear(y => y+1); setCalMonth(1); } else setCalMonth(m => m+1); }}
            />
          </section>
        )}

        {/* Paso 3 */}
        {step >= 3 && date && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Elegí un horario</h2>
              <button onClick={() => { setStep(2); setDate(""); setSlot(""); }}
                className="text-xs text-gray-400 underline">Cambiar fecha</button>
            </div>
            <SlotPicker slots={slots} selected={slot} loading={loadingSlots}
              onSelect={(s) => { setSlot(s); setStep(4); }} />
          </section>
        )}

        {/* Paso 4 */}
        {step >= 4 && slot && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Tus datos</h2>
              <button onClick={() => { setStep(3); setSlot(""); }}
                className="text-xs text-gray-400 underline">Cambiar horario</button>
            </div>
            <BookingForm
              service={service!} date={date} slot={slot}
              onSubmit={handleBook}
              loading={createAppt.isPending}
              error={createAppt.error?.message}
            />
          </section>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
};