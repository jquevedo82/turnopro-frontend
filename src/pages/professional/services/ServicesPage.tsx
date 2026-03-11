import { useState } from "react";
import { useMyServices, useCreateService, useUpdateService } from "@/hooks/useServices";
import { PageLoader } from "@/components/ui/Spinner";
import { useForm } from "react-hook-form";
import type { Service } from "@/types";

interface ServiceForm { name: string; description?: string; durationMinutes: number; bufferMinutes?: number }

export const ServicesPage = () => {
  const { data: services = [], isLoading } = useMyServices();
  const createSvc = useCreateService();
  const updateSvc = useUpdateService();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Service | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceForm>();

  const onSubmit = async (data: ServiceForm) => {
    // Convertir a número explícitamente — los inputs siempre devuelven strings
    const payload = {
      ...data,
      durationMinutes: Number(data.durationMinutes),
      bufferMinutes:   data.bufferMinutes ? Number(data.bufferMinutes) : undefined,
    };
    if (editing) {
      await updateSvc.mutateAsync({ id: editing.id, data: payload });
    } else {
      await createSvc.mutateAsync(payload);
    }
    reset(); setShowForm(false); setEditing(null);
  };

  const startEdit = (s: Service) => { setEditing(s); setShowForm(true); reset({ name: s.name, description: s.description, durationMinutes: s.durationMinutes, bufferMinutes: s.bufferMinutes ?? undefined }); };

  if (isLoading) return <PageLoader />;

  return (
    <div className="page">
      <div className="section-hd">
        <h1 className="page-title">🩺 Servicios</h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); reset(); }} className="btn btn-primary btn-sm">
          {showForm ? "✕ Cancelar" : "+ Nuevo servicio"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="card-header"><span className="card-title">{editing ? "Editar servicio" : "Nuevo servicio"}</span></div>
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="form-label">Nombre del servicio *</label>
                <input {...register("name", { required: "Requerido" })} className="form-input" placeholder="Ej: Consulta General" />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Descripción</label>
                <textarea {...register("description")} className="form-input" rows={2} />
              </div>
              <div>
                <label className="form-label">Duración (minutos) *</label>
                <input type="number" {...register("durationMinutes", { required: true, min: 5 })} className="form-input" />
              </div>
              <div>
                <label className="form-label">Buffer post-turno (minutos)</label>
                <input type="number" {...register("bufferMinutes")} className="form-input" placeholder="Usa el del perfil" />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={createSvc.isPending || updateSvc.isPending} className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  {editing ? "Guardar cambios" : "Crear servicio"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn btn-outline">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        {services.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">🩺</div>
            <p>Todavía no cargaste ningún servicio</p>
          </div>
        ) : (
          services.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-900">{s.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">⏱ {s.durationMinutes} min{s.bufferMinutes ? ` + ${s.bufferMinutes}m buffer` : ""}</div>
                {s.description && <div className="text-xs text-gray-500 mt-1 line-clamp-1">{s.description}</div>}
              </div>
              <button onClick={() => startEdit(s)} className="btn btn-outline btn-sm">Editar</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};