import { useForm } from "react-hook-form";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate } from "@/utils/dates";
import type { Service } from "@/types";

interface FormData { name: string; email: string; phone: string; notes?: string }
interface Props { service: Service; date: string; slot: string; onSubmit: (d: FormData) => void; loading: boolean; error?: string }

export const BookingForm = ({ service, date, slot, onSubmit, loading, error }: Props) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>();
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-5 text-sm text-blue-800">
        <strong>{service.name}</strong> · {formatDate(date)} · <strong>{slot}hs</strong>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="form-label">Nombre completo *</label>
          <input {...register("name", { required: "Requerido" })} className="form-input" placeholder="Ej: Juan Pérez" />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>
        <div>
          <label className="form-label">Email *</label>
          <input {...register("email", { required: "Requerido", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" } })} className="form-input" placeholder="tu@email.com" type="email" />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>
        <div>
          <label className="form-label">Teléfono / WhatsApp *</label>
          <PhoneInput
            value={watch("phone") ?? ""}
            onChange={(v) => setValue("phone", v, { shouldValidate: true })}
            required
          />
          {errors.phone && <p className="form-error">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="form-label">Nota opcional</label>
          <textarea {...register("notes")} className="form-input" rows={2} placeholder="Algún comentario para el profesional..." />
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">{error}</div>}
        <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-2">
          {loading ? <><Spinner size="sm" /> Procesando...</> : "✓ Confirmar mi cita"}
        </button>
      </form>
    </div>
  );
};