/**
 * NewAppointmentPage.tsx
 * Crear cita manual desde el panel — para secretaria o médico
 * cuando el paciente llama o se presenta en persona.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMyServices } from "@/hooks/useServices";
import { useSlots } from "@/hooks/useAvailability";
import { appointmentsApi } from "@/api/appointments.api";
import { useAuthStore } from "@/store/auth.store";
import { today } from "@/utils/dates";
import toast from "@/utils/toast";

interface FormData {
  clientName:  string;
  clientPhone: string;
  clientEmail: string;
  serviceId:   number;
  date:        string;
  startTime:   string;
  notes:       string;
}

export const NewAppointmentPage = () => {
  const navigate    = useNavigate();
  const { user }    = useAuthStore();
  const professionalId = user?.id ?? 0;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: { date: today() },
  });

  const [loading, setLoading] = useState(false);
  const selectedServiceId = Number(watch("serviceId"));
  const selectedDate      = watch("date");
  const selectedSlot      = watch("startTime");

  const { data: services = [] } = useMyServices();
  const { data: slots = [], isFetching: loadingSlots } = useSlots(
    professionalId,
    selectedDate,
    selectedServiceId || undefined,
  );

  const onSubmit = async (data: FormData) => {
    if (!data.startTime) { toast.error("Seleccioná un horario"); return; }
    setLoading(true);
    try {
      await appointmentsApi.create({
        professionalId,
        serviceId:   Number(data.serviceId),
        clientName:  data.clientName,
        clientPhone: data.clientPhone,
        clientEmail: data.clientEmail || '',
        date:        data.date,
        startTime:   data.startTime,
        notes:       data.notes || undefined,
      });
      toast.success("Cita creada correctamente");
      navigate("/panel");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "No se pudo crear la cita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="section-hd">
        <div>
          <h1 className="page-title">📋 Nueva cita</h1>
          <p className="text-xs text-gray-400 mt-0.5">Carga manual — presencial o telefónica</p>
        </div>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">← Volver</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">

        {/* Datos del paciente */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">👤 Datos del paciente</h2>

          <div>
            <label className="form-label">Nombre y apellido *</label>
            <input {...register("clientName", { required: "Requerido" })}
              className="form-input" placeholder="Juan Pérez" autoFocus />
            {errors.clientName && <p className="form-error">{errors.clientName.message}</p>}
          </div>

          <div>
            <label className="form-label">Teléfono *</label>
            <input {...register("clientPhone", { required: "Requerido" })}
              className="form-input" placeholder="+54 9 11 1234-5678" type="tel" />
            {errors.clientPhone && <p className="form-error">{errors.clientPhone.message}</p>}
          </div>

          <div>
            <label className="form-label">Email <span className="text-gray-400 font-normal">(opcional — para enviarle confirmación)</span></label>
            <input {...register("clientEmail")}
              className="form-input" placeholder="paciente@email.com" type="email" />
          </div>
        </div>

        {/* Servicio y fecha */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">🩺 Servicio y horario</h2>

          <div>
            <label className="form-label">Servicio *</label>
            <select {...register("serviceId", { required: "Seleccioná un servicio" })}
              className="form-input" onChange={(e) => { setValue("serviceId", Number(e.target.value)); setValue("startTime", ""); }}>
              <option value="">— Seleccioná un servicio —</option>
              {services.filter(s => s.isActive).map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes} min)</option>
              ))}
            </select>
            {errors.serviceId && <p className="form-error">{errors.serviceId.message}</p>}
          </div>

          <div>
            <label className="form-label">Fecha *</label>
            <input {...register("date", { required: "Requerido" })}
              type="date" className="form-input"
              onChange={(e) => { setValue("date", e.target.value); setValue("startTime", ""); }} />
          </div>

          {/* Slots */}
          {selectedServiceId && selectedDate && (
            <div>
              <label className="form-label">
                Horario disponible *
                {loadingSlots && <span className="text-xs text-gray-400 ml-2">cargando...</span>}
              </label>
              {slots.length === 0 && !loadingSlots ? (
                <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-3">
                  ⚠️ No hay horarios disponibles para este día
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {slots.map((slot) => (
                    <button key={slot} type="button"
                      onClick={() => setValue("startTime", slot)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        selectedSlot === slot
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-400"
                      }`}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
              <input type="hidden" {...register("startTime")} />
            </div>
          )}
        </div>

        {/* Notas */}
        <div className="card p-5">
          <label className="form-label">Notas internas <span className="text-gray-400 font-normal">(opcional)</span></label>
          <textarea {...register("notes")} rows={3}
            className="form-input resize-none"
            placeholder="Motivo de consulta, indicaciones especiales..." />
        </div>

        {/* Resumen antes de confirmar */}
        {selectedSlot && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-sm text-blue-800 font-medium">
              📅 Cita el <strong>{selectedDate}</strong> a las <strong>{selectedSlot}hs</strong>
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              Se creará como confirmada y se enviará email al paciente si ingresaste uno.
            </p>
          </div>
        )}

        <button type="submit" disabled={loading || !selectedSlot}
          className="btn btn-primary btn-full">
          {loading ? "Creando cita..." : "✅ Confirmar cita"}
        </button>

      </form>
    </div>
  );
};
