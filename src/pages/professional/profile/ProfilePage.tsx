/**
 * ProfilePage.tsx
 * Usa GET /professionals/me y PATCH /professionals/me
 * Solo manda los campos editables (no relaciones ni campos del superadmin)
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalsApi } from "@/api/professionals.api";
import { useForm } from "react-hook-form";
import { PageLoader } from "@/components/ui/Spinner";
import toast from "@/utils/toast";
import { useEffect, useState } from "react";
import { PhoneInput } from "@/components/ui/PhoneInput";

interface ProfileForm {
  name:               string;
  profession:         string;
  phone:              string;
  whatsappPhone:      string;
  slogan:             string;
  bio:                string;
  address:            string;
  publicEmail:        string;
  instagram:          string;
  facebook:           string;
  autoConfirm:        boolean;
  slotDurationMinutes: number;
  bufferMinutes:       number;
  minAdvanceHours:     number;
  maxAdvanceDays:      number;
  cancellationHours:   number;
  pendingExpiryHours:  number;
}

export const ProfilePage = () => {
  const qc = useQueryClient();

  const { data: prof, isLoading } = useQuery({
    queryKey: ["professional", "me"],
    queryFn:  professionalsApi.getMe,
  });

  const update = useMutation({
    mutationFn: professionalsApi.updateMe,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["professional", "me"] });
      toast.success("Perfil guardado correctamente ✓");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || "Error al guardar"));
    },
  });

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>();

  // Poblar el formulario cuando llegan los datos
  useEffect(() => {
    if (!prof) return;
    reset({
      name:               prof.name               ?? "",
      profession:         prof.profession         ?? "",
      phone:              prof.phone              ?? "",
      whatsappPhone:      prof.whatsappPhone      ?? "",
      slogan:             prof.slogan             ?? "",
      bio:                prof.bio                ?? "",
      address:            prof.address            ?? "",
      publicEmail:        prof.publicEmail        ?? "",
      instagram:          prof.instagram          ?? "",
      facebook:           prof.facebook           ?? "",
      autoConfirm:        prof.autoConfirm        ?? false,
      slotDurationMinutes: prof.slotDurationMinutes ?? 30,
      bufferMinutes:       prof.bufferMinutes       ?? 5,
      minAdvanceHours:     prof.minAdvanceHours     ?? 1,
      maxAdvanceDays:      prof.maxAdvanceDays      ?? 30,
      cancellationHours:   prof.cancellationHours   ?? 24,
      pendingExpiryHours:  prof.pendingExpiryHours  ?? 2,
    });
  }, [prof, reset]);

  const onSubmit = (data: ProfileForm) => {
    // Convertir los campos numéricos explícitamente (react-hook-form puede dejarlos como string)
    update.mutate({
      ...data,
      slotDurationMinutes: Number(data.slotDurationMinutes),
      bufferMinutes:       Number(data.bufferMinutes),
      minAdvanceHours:     Number(data.minAdvanceHours),
      maxAdvanceDays:      Number(data.maxAdvanceDays),
      cancellationHours:   Number(data.cancellationHours),
      pendingExpiryHours:  Number(data.pendingExpiryHours),
    });
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="page">
      <div className="section-hd">
        <h1 className="page-title">⚙️ Mi perfil</h1>
        {prof?.slug && (
          <a
            href={`/${prof.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-sm"
          >
            🌐 Ver página pública
          </a>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Información pública */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Información pública</span>
          </div>
          <div className="card-body grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nombre completo *</label>
              <input
                {...register("name", { required: "El nombre es requerido" })}
                className="form-input"
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>
            <div>
              <label className="form-label">Profesión / Especialidad</label>
              <input {...register("profession")} className="form-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Slogan</label>
              <input
                {...register("slogan")}
                className="form-input"
                placeholder="Frase corta de presentación"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Biografía</label>
              <textarea {...register("bio")} className="form-input" rows={3} />
            </div>
            <div>
              <label className="form-label">Teléfono público</label>
              <PhoneInput
                value={watch("phone") ?? ""}
                onChange={(v) => setValue("phone", v, { shouldDirty: true })}
              />
            </div>
            <div>
              <label className="form-label">WhatsApp (notificaciones)</label>
              <PhoneInput
                value={watch("whatsappPhone") ?? ""}
                onChange={(v) => setValue("whatsappPhone", v, { shouldDirty: true })}
              />
              <p className="text-xs text-gray-400 mt-1">📲 A este número te llegan los avisos de nuevas citas</p>
            </div>
            <div>
              <label className="form-label">Email público</label>
              <input {...register("publicEmail")} className="form-input" type="email" />
            </div>
            <div>
              <label className="form-label">Dirección</label>
              <input {...register("address")} className="form-input" />
            </div>
            <div>
              <label className="form-label">Instagram</label>
              <input {...register("instagram")} className="form-input" placeholder="@usuario" />
            </div>
            <div>
              <label className="form-label">Facebook</label>
              <input {...register("facebook")} className="form-input" />
            </div>
          </div>
        </div>

        {/* Reglas de reserva */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Reglas de reserva</span>
            <span className="text-xs text-gray-400">Afectan el calendario de turnos</span>
          </div>
          <div className="card-body grid grid-cols-2 sm:grid-cols-3 gap-4">
            {([
              { key: "slotDurationMinutes", label: "Duración del turno",     unit: "min",    min: 5  },
              { key: "bufferMinutes",       label: "Buffer entre turnos",    unit: "min",    min: 0  },
              { key: "minAdvanceHours",     label: "Anticipación mínima",    unit: "horas",  min: 0  },
              { key: "maxAdvanceDays",      label: "Anticipación máxima",    unit: "días",   min: 1  },
              { key: "cancellationHours",   label: "Plazo de cancelación",   unit: "horas",  min: 0  },
              { key: "pendingExpiryHours",  label: "Expiran pendientes en",  unit: "horas",  min: 1  },
            ] as const).map(({ key, label, unit, min }) => (
              <div key={key}>
                <label className="form-label">
                  {label}
                  <span className="ml-1 text-gray-400 font-normal">({unit})</span>
                </label>
                <input
                  type="number"
                  min={min}
                  {...register(key, {
                    required: "Requerido",
                    min: { value: min, message: `Mínimo ${min}` },
                    valueAsNumber: true,
                  })}
                  className="form-input"
                />
                {errors[key] && <p className="form-error">{errors[key]?.message}</p>}
              </div>
            ))}

            <div className="col-span-2 sm:col-span-3 pt-2 border-t border-gray-100 mt-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("autoConfirm")}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  Confirmación automática{" "}
                  <span className="text-gray-400 font-normal">(el turno se confirma solo, sin aprobación manual)</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={update.isPending || !isDirty}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {update.isPending ? "Guardando..." : "Guardar cambios"}
          </button>
          {isDirty && (
            <button
              type="button"
              onClick={() => reset()}
              className="btn btn-outline"
            >
              Descartar
            </button>
          )}
          {!isDirty && !update.isPending && (
            <span className="text-xs text-gray-400">✓ Sin cambios pendientes</span>
          )}
        </div>
      </form>

      {/* ── Cambiar contraseña ─────────────────────────────────────── */}
      <ChangePasswordSection />
    </div>
  );
};

// ── Sección independiente de cambio de contraseña ────────────────────────────
const ChangePasswordSection = () => {
  const [current,  setCurrent]  = useState("");
  const [next,     setNext]     = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [show,     setShow]     = useState(false);

  const handleSubmit = async () => {
    if (!current || !next || !confirm) {
      return alert("Completá todos los campos");
    }
    if (next.length < 6) {
      return alert("La nueva contraseña debe tener al menos 6 caracteres");
    }
    if (next !== confirm) {
      return alert("Las contraseñas no coinciden");
    }
    if (!window.confirm("¿Confirmar cambio de contraseña?")) return;

    setLoading(true);
    try {
      const { api } = await import("@/config/api");
      await api.post("/professionals/change-password", {
        currentPassword: current,
        newPassword:     next,
      });
      alert("✅ Contraseña actualizada correctamente");
      setCurrent(""); setNext(""); setConfirm("");
      setShow(false);
    } catch (e: any) {
      const msg = e.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join(", ") : (msg || "Error al cambiar la contraseña"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5 mt-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm text-gray-700">🔒 Contraseña</h2>
          <p className="text-xs text-gray-400 mt-0.5">Cambiá tu contraseña de acceso al panel</p>
        </div>
        <button onClick={() => setShow(!show)} className="btn btn-outline btn-sm">
          {show ? "Cancelar" : "Cambiar contraseña"}
        </button>
      </div>

      {show && (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <div>
            <label className="form-label">Contraseña actual</label>
            <input type="password" value={current} onChange={e => setCurrent(e.target.value)}
              className="form-input" placeholder="Tu contraseña actual" autoComplete="current-password" />
          </div>
          <div>
            <label className="form-label">Nueva contraseña</label>
            <input type="password" value={next} onChange={e => setNext(e.target.value)}
              className="form-input" placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
          </div>
          <div>
            <label className="form-label">Confirmar nueva contraseña</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              className="form-input" placeholder="Repetí la nueva contraseña" autoComplete="new-password" />
          </div>
          {next && confirm && next !== confirm && (
            <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
          )}
          <button onClick={handleSubmit} disabled={loading}
            className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Guardando..." : "✅ Actualizar contraseña"}
          </button>
        </div>
      )}
    </div>
  );
};