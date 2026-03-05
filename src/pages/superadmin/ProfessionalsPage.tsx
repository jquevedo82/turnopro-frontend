/**
 * ProfessionalsPage.tsx — CRUD de profesionales para el superadmin.
 * Alta, activación/desactivación y edición de suscripción.
 */
import { useState } from "react";
import { useProfessionals, useCreateProfessional, useActivateProfessional, useDeactivateProfessional } from "@/hooks/useProfessionals";
import { useQuery } from "@tanstack/react-query";
import { plansApi } from "@/api/plans.api";
import { PageLoader } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDateShort } from "@/utils/dates";
import { useForm } from "react-hook-form";
import toast from "@/utils/toast";

interface ProfForm { name: string; email: string; password: string; profession: string; slug: string; phone?: string; planId?: number }

export const ProfessionalsPage = () => {
  const { data: professionals = [], isLoading } = useProfessionals();
  const { data: plans = [] } = useQuery({ queryKey: ["plans"], queryFn: plansApi.getAll });
  const createProf    = useCreateProfessional();
  const activateProf  = useActivateProfessional();
  const deactivate    = useDeactivateProfessional();

  const [showForm,     setShowForm]     = useState(false);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [subEnd,       setSubEnd]       = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfForm>();

  const onSubmit = async (data: ProfForm) => {
    await createProf.mutateAsync(data);
    reset(); setShowForm(false);
    toast.success("Profesional creado exitosamente");
  };

  const handleActivate = async (id: number) => {
    if (!subEnd) { toast.error("Indicá la fecha de vencimiento"); return; }
    await activateProf.mutateAsync({ id, subscriptionEnd: subEnd });
    setActivatingId(null); setSubEnd("");
    toast.success("Suscripción activada");
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="page">
      <div className="section-hd">
        <h1 className="page-title">👨‍⚕️ Profesionales</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          {showForm ? "✕ Cancelar" : "+ Alta profesional"}
        </button>
      </div>

      {/* Formulario de alta */}
      {showForm && (
        <div className="card mb-6">
          <div className="card-header"><span className="card-title">Alta de profesional</span></div>
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nombre completo *</label>
                <input {...register("name", { required: true })} className="form-input" />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input type="email" {...register("email", { required: true })} className="form-input" />
              </div>
              <div>
                <label className="form-label">Contraseña inicial *</label>
                <input type="password" {...register("password", { required: true, minLength: 8 })} className="form-input" />
              </div>
              <div>
                <label className="form-label">Profesión *</label>
                <input {...register("profession", { required: true })} className="form-input" placeholder="Ej: Médico Clínico" />
              </div>
              <div>
                <label className="form-label">Slug (URL) *</label>
                <input {...register("slug", { required: true, pattern: /^[a-z0-9-]+$/ })} className="form-input" placeholder="dr-garcia" />
                <p className="text-xs text-gray-400 mt-1">Solo letras minúsculas, números y guiones</p>
              </div>
              <div>
                <label className="form-label">Teléfono</label>
                <input {...register("phone")} className="form-input" />
              </div>
              <div>
                <label className="form-label">Plan</label>
                <select {...register("planId", { valueAsNumber: true })} className="form-select">
                  <option value="">Sin plan</option>
                  {plans.map((p) => <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={createProf.isPending} className="btn btn-primary">
                  {createProf.isPending ? "Creando..." : "Crear profesional"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="card">
        {professionals.map((p) => (
          <div key={p.id} className="px-5 py-4 border-b border-gray-100 last:border-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-violet-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.email} · /{p.slug}</div>
                  <div className="text-xs text-gray-400">{p.profession}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                <StatusBadge status={p.isActive ? "active" : "inactive"} />
                {p.subscriptionEnd && <span className="text-xs text-gray-400">hasta {formatDateShort(p.subscriptionEnd)}</span>}

                {/* Activar */}
                {activatingId === p.id ? (
                  <div className="flex items-center gap-2">
                    <input type="date" value={subEnd} onChange={(e) => setSubEnd(e.target.value)}
                      className="form-input text-xs w-36 py-1" />
                    <button onClick={() => handleActivate(p.id)} className="btn btn-success btn-xs">✓</button>
                    <button onClick={() => setActivatingId(null)} className="btn btn-outline btn-xs">✕</button>
                  </div>
                ) : (
                  <>
                    {!p.isActive && (
                      <button onClick={() => setActivatingId(p.id)} className="btn btn-success btn-xs">Activar</button>
                    )}
                    {p.isActive && (
                      <button onClick={() => deactivate.mutate(p.id)} className="btn btn-danger btn-xs">Desactivar</button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
