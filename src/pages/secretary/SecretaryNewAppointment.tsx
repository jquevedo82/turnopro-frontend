/**
 * SecretaryNewAppointment.tsx
 * Nueva cita manual desde el panel secretaria.
 * Igual que NewAppointmentPage pero opera en nombre del profesional activo.
 *
 * Diferencias clave vs NewAppointmentPage:
 *  - professionalId viene de useActiveProfessional() (no del JWT)
 *  - servicios se piden con ?professionalId=X
 *  - navega a /secretaria al confirmar
 *  - muestra guard si no hay profesional activo seleccionado
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useSlots } from "@/hooks/useAvailability";
import { useCreateAppointmentForProfessional } from "@/hooks/useAppointments";
import { useActiveProfessional } from "@/store/auth.store";
import { api } from "@/config/api";
import { today } from "@/utils/dates";
import toast from "@/utils/toast";
import { PhoneInput } from "@/components/ui/PhoneInput";
import type { Service } from "@/types";

interface FormData {
  clientName:  string;
  clientPhone: string;
  clientEmail: string;
  serviceId:   number;
  date:        string;
  startTime:   string;
  notes:       string;
}

export const SecretaryNewAppointment = () => {
  const navigate           = useNavigate();
  const activeProfessional = useActiveProfessional();
  const professionalId     = activeProfessional?.id ?? 0;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: { date: today() },
  });

  const [loading, setLoading]     = useState(false);
  const createAppointment         = useCreateAppointmentForProfessional(professionalId);

  const selectedServiceId = Number(watch("serviceId"));
  const selectedDate      = watch("date");
  const selectedSlot      = watch("startTime");

  // Servicios del profesional activo
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["services", "forProfessional", professionalId],
    queryFn:  () => api.get(`/services?professionalId=${professionalId}`).then(r => r.data),
    enabled:  !!professionalId,
  });

  const { data: slots = [], isFetching: loadingSlots } = useSlots(
    professionalId,
    selectedDate,
    selectedServiceId || undefined,
  );

  // Guard: sin profesional activo no se puede crear cita
  if (!activeProfessional) {
    return (
      <div className="page">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="font-semibold text-amber-800">Seleccioná un profesional primero</p>
          <p className="text-sm text-amber-600 mt-1">
            Usá el selector "Trabajando como..." en la barra lateral para elegir el profesional.
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    if (!data.startTime) { toast.error("Seleccioná un horario"); return; }
    setLoading(true);
    try {
      await createAppointment.mutateAsync({
        professionalId,
        serviceId:   Number(data.serviceId),
        clientName:  data.clientName,
        clientPhone: data.clientPhone,
        clientEmail: data.clientEmail || "",
        date:        data.date,
        startTime:   data.startTime,
        notes:       data.notes || undefined,
      });
      toast.success("Cita creada correctamente");
      navigate("/secretaria");
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
          <p className="text-xs text-gray-400 mt-0.5">
            Para <span className="font-medium text-gray-600">{activeProfessional.name}</span> · carga manual
          </p>
        </div>
        <button onClick={() => navigate("/secretaria")} className="btn btn-outline btn-sm">← Volver</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">

        {/* Datos del paciente */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">👤 Datos del paciente</h2>

          <div>
            <label className="form-label">Nombre del paciente *</label>
            <input {...register("clientName", {
              required: "Requerido",
              pattern: {
                value: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+\s+[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+/,
                message: "Ingresá al menos un nombre y un apellido",
              },
            })}
              className="form-input" placeholder="Ej: Juan García"
              autoFocus autoCapitalize="words" />
            <p className="text-xs text-gray-400 mt-1">Primer nombre y primer apellido del paciente</p>
            {errors.clientName && <p className="form-error">{errors.clientName.message}</p>}
          </div>

          <div>
            <label className="form-label">Teléfono *</label>
            <PhoneInput
              value={watch("clientPhone") ?? ""}
              onChange={(v) => setValue("clientPhone", v, { shouldDirty: true })}
            />
            {errors.clientPhone && <p className="form-error">{errors.clientPhone.message}</p>}
          </div>

          <div>
            <label className="form-label">
              Email <span className="text-gray-400 font-normal">(opcional — para enviarle confirmación)</span>
            </label>
            <input {...register("clientEmail")}
              className="form-input" placeholder="paciente@email.com" type="email" />
          </div>
        </div>

        {/* Servicio y horario */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">🩺 Servicio y horario</h2>

          <div>
            <label className="form-label">Servicio *</label>
            <select {...register("serviceId", { required: "Seleccioná un servicio" })}
              className="form-input"
              onChange={(e) => { setValue("serviceId", Number(e.target.value)); setValue("startTime", ""); }}>
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
          <label className="form-label">
            Notas internas <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea {...register("notes")} rows={3}
            className="form-input resize-none"
            placeholder="Motivo de consulta, indicaciones especiales..." />
        </div>

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
          className="btn btn-primary btn-full disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Creando cita..." : "✅ Confirmar cita"}
        </button>

      </form>
    </div>
  );
};
