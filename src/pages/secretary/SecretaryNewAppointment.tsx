/**
 * SecretaryNewAppointment.tsx
 * Nueva cita manual desde el panel de secretaria.
 * Misma lógica que NewAppointmentPage del profesional pero:
 *   - Usa activeProfessionalId del contexto en lugar del JWT
 *   - Navega a /secretaria al confirmar
 *   - Responsive mobile-first
 */
import { useState }     from "react";
import { useNavigate }  from "react-router-dom";
import { useForm }      from "react-hook-form";
import { useQuery }     from "@tanstack/react-query";
import { useAuthStore, useActiveProfessional } from "@/store/auth.store";
import { useSlots }     from "@/hooks/useAvailability";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { servicesApi }  from "@/api/services.api";
import { today }        from "@/utils/dates";
import toast            from "@/utils/toast";
import { PhoneInput }   from "@/components/ui/PhoneInput";
import { api } from "@/config/api";
import { Service } from "@/types";
import { useVerticalConfig } from "@/hooks/useVerticalConfig";

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
  const navigate             = useNavigate();
  const activeProfessionalId = useAuthStore((s) => s.activeProfessionalId);
  const activeProfessional   = useActiveProfessional();
  const vc = useVerticalConfig(activeProfessional?.professionalType);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: { date: today() },
  });

  const createAppointment = useCreateAppointment();
  const selectedServiceId = Number(watch("serviceId"));
  const selectedDate      = watch("date");
  const selectedSlot      = watch("startTime");

  // Servicios activos del profesional activo
  const { data: services = [] } = useQuery({
    queryKey: ["services", activeProfessionalId],
    queryFn:  () => api.get(`/services?professionalId=${activeProfessionalId}`).then(r => r.data),
    enabled:  !!activeProfessionalId,
  });

  const { data: slots = [], isFetching: loadingSlots } = useSlots(
    activeProfessionalId ?? 0,
    selectedDate,
    selectedServiceId || undefined,
  );

  const onSubmit = async (data: FormData) => {
    if (!data.startTime) { toast.error("Seleccioná un horario"); return; }
    if (!activeProfessionalId) { toast.error("No hay profesional seleccionado"); return; }
    setLoading(true);
    try {
      await createAppointment.mutateAsync({
        professionalId: activeProfessionalId,
        serviceId:      Number(data.serviceId),
        clientName:     data.clientName,
        clientPhone:    data.clientPhone,
        clientEmail:    data.clientEmail || "",
        date:           data.date,
        startTime:      data.startTime,
        notes:          data.notes || undefined,
      });
      toast.success("Cita creada correctamente");
      navigate("/secretaria");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "No se pudo crear la cita");
    } finally {
      setLoading(false);
    }
  };

  if (!activeProfessionalId) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p className="text-4xl mb-3">👆</p>
        <p className="font-medium text-gray-600">Seleccioná un profesional primero</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="section-hd">
        <div>
          <h1 className="page-title">📋 Nueva cita</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Para <span className="font-medium text-gray-600">{activeProfessional?.name}</span>
          </p>
        </div>
        <button onClick={() => navigate("/secretaria")} className="btn btn-outline btn-sm">
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">

        {/* Datos del cliente */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
            👤 Datos del {vc.clientLabel.toLowerCase()}
          </h2>

          <div>
            <label className="form-label">Nombre del {vc.clientLabel.toLowerCase()} *</label>
            <input
              {...register("clientName", {
                required: "Requerido",
                pattern: {
                  value:   /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+\s+[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+/,
                  message: "Ingresá al menos un nombre y un apellido",
                },
              })}
              className="form-input"
              placeholder="Ej: Juan García"
              autoCapitalize="words"
            />
            <p className="text-xs text-gray-400 mt-1">Primer nombre y primer apellido</p>
            {errors.clientName && <p className="form-error">{errors.clientName.message}</p>}
          </div>

          <div>
            <label className="form-label">Teléfono *</label>
            <PhoneInput
              value={watch("clientPhone") ?? ""}
              onChange={(v) => setValue("clientPhone", v, { shouldDirty: true })}
              required
            />
            {errors.clientPhone && <p className="form-error">{errors.clientPhone.message}</p>}
          </div>

          <div>
            <label className="form-label">
              Email{" "}
              <span className="text-gray-400 font-normal">(opcional — para enviarle confirmación)</span>
            </label>
            <input
              {...register("clientEmail")}
              className="form-input"
              placeholder="paciente@email.com"
              type="email"
            />
          </div>
        </div>

        {/* Servicio y horario */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
            🩺 Servicio y horario
          </h2>

          <div>
            <label className="form-label">Servicio *</label>
            <select
              {...register("serviceId", { required: "Seleccioná un servicio" })}
              className="form-input"
              onChange={(e) => {
                setValue("serviceId", Number(e.target.value));
                setValue("startTime", "");
              }}>
              <option value="">— Seleccioná un servicio —</option>
              {services.filter((s: Service) => s.isActive).map((s: Service) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} min)
                </option>
              ))}
            </select>
            {errors.serviceId && <p className="form-error">{errors.serviceId.message}</p>}
          </div>

          <div>
            <label className="form-label">Fecha *</label>
            <input
              {...register("date", { required: "Requerido" })}
              type="date"
              className="form-input"
              onChange={(e) => {
                setValue("date", e.target.value);
                setValue("startTime", "");
              }}
            />
          </div>

          {/* Slots disponibles */}
          {selectedServiceId && selectedDate && (
            <div>
              <label className="form-label">
                Horario disponible *
                {loadingSlots && (
                  <span className="text-xs text-gray-400 ml-2">cargando...</span>
                )}
              </label>
              {slots.length === 0 && !loadingSlots ? (
                <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-3">
                  ⚠️ No hay horarios disponibles para este día
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
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
            Notas internas{" "}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            className="form-input resize-none"
            placeholder="Motivo de consulta, indicaciones especiales..."
          />
        </div>

        {/* Resumen */}
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

        <button
          type="submit"
          disabled={loading || !selectedSlot}
          className="btn btn-primary btn-full disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Creando cita..." : "✅ Confirmar cita"}
        </button>

      </form>
    </div>
  );
};