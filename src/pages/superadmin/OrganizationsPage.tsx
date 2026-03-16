/**
 * OrganizationsPage.tsx — Gestión de organizaciones/clínicas para el superadmin.
 *
 * Flujo completo en una sola página:
 *   1. Lista de organizaciones con stats
 *   2. Click en una org → panel de detalle con:
 *        - Profesionales asignados (asignar / desvincular)
 *        - Secretarias (crear / activar / desactivar / reenviar credenciales)
 *   3. Formulario de alta de organización
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { organizationsApi, type OrgDetail, type OrgSummary } from "@/api/organizations.api";
import { PageLoader, Spinner } from "@/components/ui/Spinner";
import { PhoneInput } from "@/components/ui/PhoneInput";
import toast from "@/utils/toast";

// ── Helpers ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) => {
  const sz = size === "md" ? "w-10 h-10 text-base" : "w-8 h-8 text-sm";
  return (
    <div className={`${sz} bg-gradient-to-br from-blue-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
export const OrganizationsPage = () => {
  const qc = useQueryClient();
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [showCreateOrg, setShowCreateOrg] = useState(false);

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn:  organizationsApi.getAll,
  });

  const createOrg = useMutation({
    mutationFn: organizationsApi.create,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organización creada");
      setShowCreateOrg(false);
      reset();
    },
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm<{
    name: string; slug?: string; address?: string; phone?: string; email?: string;
  }>();

  if (isLoading) return <PageLoader />;

  if (selectedOrgId) {
    return <OrgDetail orgId={selectedOrgId} onBack={() => setSelectedOrgId(null)} />;
  }

  return (
    <div className="page">
      <div className="section-hd">
        <h1 className="page-title">🏥 Organizaciones</h1>
        <button onClick={() => setShowCreateOrg(!showCreateOrg)} className="btn btn-primary btn-sm">
          {showCreateOrg ? "✕ Cancelar" : "+ Nueva organización"}
        </button>
      </div>

      {/* Formulario nueva org */}
      {showCreateOrg && (
        <div className="card mb-6">
          <div className="card-header"><span className="card-title">Nueva organización</span></div>
          <div className="card-body">
            <form onSubmit={handleSubmit((d) => createOrg.mutate(d))}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nombre *</label>
                <input {...register("name", { required: true })} className="form-input"
                  placeholder="Ej: Clínica del Norte" />
              </div>
              <div>
                <label className="form-label">Slug (opcional)</label>
                <input {...register("slug")} className="form-input" placeholder="clinica-del-norte" />
                <p className="text-xs text-gray-400 mt-1">Solo letras, números y guiones</p>
              </div>
              <div>
                <label className="form-label">Email de contacto</label>
                <input type="email" {...register("email")} className="form-input" />
              </div>
              <div>
                <label className="form-label">Teléfono</label>
                <PhoneInput
                  value={watch("phone") ?? ""}
                  onChange={(v) => setValue("phone", v, { shouldDirty: true })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Dirección</label>
                <input {...register("address")} className="form-input" />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={createOrg.isPending} className="btn btn-primary">
                  {createOrg.isPending ? "Creando..." : "Crear organización"}
                </button>
                <button type="button" onClick={() => setShowCreateOrg(false)} className="btn btn-outline">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de orgs */}
      {orgs.length === 0 ? (
        <div className="card">
          <div className="py-14 text-center text-gray-400">
            <p className="text-4xl mb-3">🏥</p>
            <p className="font-medium text-gray-600">No hay organizaciones creadas</p>
            <p className="text-sm mt-1">Creá una para agrupar profesionales y asignar secretarias</p>
          </div>
        </div>
      ) : (
        <div className="card">
          {orgs.map((org) => (
            <div key={org.id}
              className="flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedOrgId(org.id)}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{org.name}</div>
                  <div className="text-xs text-gray-400">
                    {org.professionalsCount} profesional{org.professionalsCount !== 1 ? "es" : ""} ·{" "}
                    {org.secretariesCount} secretaria{org.secretariesCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${org.isActive ? "badge-green" : "badge-red"}`}>
                  {org.isActive ? "Activa" : "Inactiva"}
                </span>
                <span className="text-gray-300 text-sm">›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Panel de detalle de una organización ─────────────────────────────────────
const OrgDetail = ({ orgId, onBack }: { orgId: number; onBack: () => void }) => {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"profesionales" | "secretarias">("profesionales");

  const { data: org, isLoading } = useQuery<OrgDetail>({
    queryKey: ["organizations", orgId],
    queryFn:  () => organizationsApi.getOne(orgId),
  });

  const { data: unassigned = [] } = useQuery({
    queryKey: ["organizations", "unassigned"],
    queryFn:  organizationsApi.getUnassigned,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["organizations"] });
    qc.invalidateQueries({ queryKey: ["organizations", "unassigned"] });
  };

  const assignProf = useMutation({
    mutationFn: (profId: number) => organizationsApi.assignProfessional(orgId, profId),
    onSuccess:  () => { invalidate(); toast.success("Profesional asignado"); },
  });

  const removeProf = useMutation({
    mutationFn: (profId: number) => organizationsApi.removeProfessional(orgId, profId),
    onSuccess:  () => { invalidate(); toast.success("Profesional desvinculado"); },
  });

  if (isLoading || !org) return <PageLoader />;

  return (
    <div className="page">
      <div className="section-hd">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn btn-outline btn-sm">← Volver</button>
          <div>
            <h1 className="page-title">{org.name}</h1>
            {org.address && <p className="text-xs text-gray-400 mt-0.5">{org.address}</p>}
          </div>
        </div>
        <span className={`badge ${org.isActive ? "badge-green" : "badge-red"}`}>
          {org.isActive ? "Activa" : "Inactiva"}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {(["profesionales", "secretarias"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t === "profesionales"
              ? `👨‍⚕️ Profesionales (${org.professionals.length})`
              : `👩‍💼 Secretarias (${org.secretaries.length})`
            }
          </button>
        ))}
      </div>

      {/* Tab: Profesionales */}
      {tab === "profesionales" && (
        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Profesionales asignados</span>
            </div>
            {org.professionals.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                No hay profesionales en esta organización
              </div>
            ) : (
              org.professionals.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.profession} · /{p.slug}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Desvincular a ${p.name} de ${org.name}? Volverá a ser profesional independiente.`))
                        removeProf.mutate(p.id);
                    }}
                    disabled={removeProf.isPending}
                    className="btn btn-outline btn-xs text-red-500 hover:bg-red-50 hover:border-red-300">
                    Desvincular
                  </button>
                </div>
              ))
            )}
          </div>

          {unassigned.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Agregar profesional independiente</span>
              </div>
              {unassigned.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} />
                    <div>
                      <div className="text-sm font-medium text-gray-700">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.profession} · {p.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => assignProf.mutate(p.id)}
                    disabled={assignProf.isPending}
                    className="btn btn-primary btn-xs">
                    {assignProf.isPending ? <Spinner size="sm" /> : "Asignar"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Secretarias */}
      {tab === "secretarias" && (
        <SecretariesTab orgId={orgId} secretaries={org.secretaries} />
      )}
    </div>
  );
};

// ── Tab secretarias ───────────────────────────────────────────────────────────
const SecretariesTab = ({
  orgId,
  secretaries,
}: {
  orgId: number;
  secretaries: OrgDetail["secretaries"];
}) => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, watch, setValue } = useForm<{
    name: string; email: string; phone?: string;
  }>();

  const invalidate = () => qc.invalidateQueries({ queryKey: ["organizations", orgId] });

  const createSec = useMutation({
    mutationFn: (data: { name: string; email: string; phone?: string }) =>
      organizationsApi.createSecretary(orgId, data),
    onSuccess: () => {
      invalidate();
      toast.success("Secretaria creada — se envió email de bienvenida");
      setShowForm(false);
      reset();
    },
    onError: () => toast.error("El email ya está registrado"),
  });

  const activateSec = useMutation({
    mutationFn: (secId: number) => organizationsApi.activateSecretary(orgId, secId),
    onSuccess:  () => { invalidate(); toast.success("Secretaria activada"); },
  });

  const deactivateSec = useMutation({
    mutationFn: (secId: number) => organizationsApi.deactivateSecretary(orgId, secId),
    onSuccess:  () => { invalidate(); toast.success("Secretaria desactivada"); },
  });

  const resendSec = useMutation({
    mutationFn: (secId: number) => organizationsApi.resendSecretaryCredentials(orgId, secId),
    onSuccess:  () => toast.success("Credenciales reenviadas por email"),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          {showForm ? "✕ Cancelar" : "+ Nueva secretaria"}
        </button>
      </div>

      {/* Formulario alta secretaria */}
      {showForm && (
        <div className="card">
          <div className="card-header"><span className="card-title">Alta de secretaria</span></div>
          <div className="card-body">
            <form onSubmit={handleSubmit((d) => createSec.mutate(d))}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nombre completo *</label>
                <input {...register("name", { required: true })} className="form-input" />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input type="email" {...register("email", { required: true })} className="form-input" />
                <p className="text-xs text-gray-400 mt-1">
                  Recibirá un email para configurar su contraseña
                </p>
              </div>
              <div>
                <label className="form-label">Teléfono</label>
                <PhoneInput
                  value={watch("phone") ?? ""}
                  onChange={(v) => setValue("phone", v, { shouldDirty: true })}
                />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={createSec.isPending} className="btn btn-primary">
                  {createSec.isPending ? "Creando..." : "Crear secretaria"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista secretarias */}
      <div className="card">
        {secretaries.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">
            <p className="text-3xl mb-2">👩‍💼</p>
            No hay secretarias en esta organización
          </div>
        ) : (
          secretaries.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{s.name}</div>
                  <div className="text-xs text-gray-400">{s.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <span className={`badge ${s.isActive ? "badge-green" : "badge-red"}`}>
                  {s.isActive ? "Activa" : "Inactiva"}
                </span>
                <button
                  onClick={() => resendSec.mutate(s.id)}
                  disabled={resendSec.isPending}
                  className="btn btn-outline btn-xs"
                  title="Reenviar email de acceso">
                  📧 Reenviar
                </button>
                {s.isActive ? (
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Desactivar a ${s.name}? No podrá iniciar sesión.`))
                        deactivateSec.mutate(s.id);
                    }}
                    className="btn btn-danger btn-xs">
                    Desactivar
                  </button>
                ) : (
                  <button
                    onClick={() => activateSec.mutate(s.id)}
                    className="btn btn-success btn-xs">
                    Activar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};