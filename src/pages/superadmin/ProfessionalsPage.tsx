/**
 * ProfessionalsPage.tsx — CRUD de profesionales para el superadmin.
 * Alta, edición, activación/desactivación de suscripción.
 */
import { useState } from "react";
import { useProfessionals, useCreateProfessional, useUpdateProfessional, useActivateProfessional, useDeactivateProfessional } from "@/hooks/useProfessionals";
import { useQuery } from "@tanstack/react-query";
import { plansApi } from "@/api/plans.api";
import { PageLoader } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDateShort } from "@/utils/dates";
import { useForm } from "react-hook-form";
import { PhoneInput } from "@/components/ui/PhoneInput";
import toast from "@/utils/toast";
import type { Professional } from "@/types";
import { PROFESSIONAL_TYPE_OPTIONS } from "@/config/verticals";
import type { ProfessionalType } from "@/config/verticals";

interface ProfForm { name: string; email: string; profession: string; slug: string; phone?: string; planId?: number; professionalType?: ProfessionalType }

export const ProfessionalsPage = () => {
  const { data: professionals = [], isLoading } = useProfessionals();
  const { data: plans = [] } = useQuery({ queryKey: ["plans"], queryFn: plansApi.getAll });
  const createProf    = useCreateProfessional();
  const updateProf    = useUpdateProfessional();
  const activateProf  = useActivateProfessional();
  const deactivate    = useDeactivateProfessional();

  const [showForm,     setShowForm]     = useState(false);
  const [editingProf,  setEditingProf]  = useState<Professional | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [subEnd,       setSubEnd]       = useState("");

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProfForm>();

  // Formulario de alta
  const onSubmit = async (data: ProfForm) => {
    await createProf.mutateAsync(data);
    reset(); setShowForm(false);
    toast.success("Profesional creado exitosamente");
  };

  // Abrir formulario de edición con datos precargados
  const handleEditOpen = (p: Professional) => {
    setEditingProf(p);
    setShowForm(false);
  };

  const handleEditClose = () => setEditingProf(null);

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProf) return;
    const form = e.currentTarget;
    const data = {
      name:       (form.elements.namedItem("name")       as HTMLInputElement).value.trim(),
      profession: (form.elements.namedItem("profession") as HTMLInputElement).value.trim(),
      slug:       (form.elements.namedItem("slug")       as HTMLInputElement).value.trim(),
      email:      (form.elements.namedItem("email")      as HTMLInputElement).value.trim(),
    };
    await updateProf.mutateAsync({ id: editingProf.id, data });
    setEditingProf(null);
    toast.success("Datos actualizados correctamente");
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
        <button onClick={() => { setShowForm(!showForm); setEditingProf(null); }} className="btn btn-primary btn-sm">
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
                <PhoneInput
                  value={watch("phone") ?? ""}
                  onChange={(v) => setValue("phone", v, { shouldDirty: true })}
                />
              </div>
              <div>
                <label className="form-label">Tipo de actividad *</label>
                <select {...register("professionalType")} className="form-select">
                  {PROFESSIONAL_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} — {opt.examples}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Define cómo el sistema llama a los clientes y las citas</p>
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

      {/* Formulario de edición */}
      {editingProf && (
        <div className="card mb-6 border-blue-200">
          <div className="card-header bg-blue-50">
            <span className="card-title text-blue-700">Editando: {editingProf.name}</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nombre completo *</label>
                <input name="name" defaultValue={editingProf.name} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input name="email" type="email" defaultValue={editingProf.email} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Profesión *</label>
                <input name="profession" defaultValue={editingProf.profession} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Slug (URL) *</label>
                <input name="slug" defaultValue={editingProf.slug} required pattern="[a-z0-9\-]+" className="form-input" />
                <p className="text-xs text-gray-400 mt-1">Solo letras minúsculas, números y guiones</p>
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={updateProf.isPending} className="btn btn-primary">
                  {updateProf.isPending ? "Guardando..." : "Guardar cambios"}
                </button>
                <button type="button" onClick={handleEditClose} className="btn btn-outline">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista */}
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

                {/* Editar */}
                <button
                  onClick={() => handleEditOpen(p)}
                  className="btn btn-outline btn-xs"
                  aria-label={`Editar ${p.name}`}
                >
                  Editar
                </button>

                {/* Activar / Desactivar */}
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
