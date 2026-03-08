/**
 * SchedulePage.tsx — Responsive. Los horarios de cada día
 * se apilan verticalmente en mobile en vez de estar en fila.
 */
import { useMySchedule, useExceptions, useUpsertDay, useCreateException, useDeleteException } from "@/hooks/useSchedule";
import { PageLoader } from "@/components/ui/Spinner";
import { DAYS_ES } from "@/utils/dates";
import { useForm } from "react-hook-form";
import { useState } from "react";

const DEFAULT_DAYS = [0,1,2,3,4,5,6].map((d) => ({
  dayOfWeek: d, startTime: "08:00", endTime: "13:00", isActive: false,
}));

export const SchedulePage = () => {
  const { data: schedule = [], isLoading } = useMySchedule();
  const { data: exceptions = [] } = useExceptions();
  const upsertDay       = useUpsertDay();
  const createException = useCreateException();
  const deleteException = useDeleteException();
  const [showExcForm, setShowExcForm] = useState(false);

  const { register: regExc, handleSubmit: handleExc, reset: resetExc, watch } =
    useForm<{ date: string; isClosed: boolean; customStartTime?: string; customEndTime?: string; reason?: string }>();

  const isClosedVal = watch("isClosed");

  const days = DEFAULT_DAYS.map(
    (def) => schedule.find((s) => s.dayOfWeek === def.dayOfWeek) ?? def
  );

  const onSubmitException = async (data: any) => {
    const isClosed = data.isClosed === true || data.isClosed === "true";
    const payload  = {
      date:            data.date,
      isClosed,
      customStartTime: isClosed ? null : (data.customStartTime || null),
      customEndTime:   isClosed ? null : (data.customEndTime   || null),
      reason:          data.reason || "",
    };
    await createException.mutateAsync(payload);
    resetExc();
    setShowExcForm(false);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="page">
      <h1 className="page-title mb-5">🕐 Horarios</h1>

      {/* Plantilla semanal */}
      <div className="card mb-5">
        <div className="card-header">
          <span className="card-title">Plantilla semanal</span>
          <span className="text-xs text-gray-400 hidden sm:inline">Activá los días que atendés</span>
        </div>
        <div className="divide-y divide-gray-100">
          {days.map((day) => (
            <div key={day.dayOfWeek} className="px-4 sm:px-5 py-3">
              {/* Fila superior: nombre del día + toggle */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 w-24">
                  {DAYS_ES[day.dayOfWeek]}
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox"
                      checked={day.isActive}
                      onChange={(e) => upsertDay.mutate({
                        dayOfWeek: day.dayOfWeek,
                        isActive:  e.target.checked,
                        startTime: day.startTime,
                        endTime:   day.endTime,
                      })}
                      className="sr-only peer"
                    />
                    {/* Toggle visual */}
                    <div className="w-10 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                  </div>
                  <span className={`text-xs font-medium ${day.isActive ? "text-blue-600" : "text-gray-400"}`}>
                    {day.isActive ? "Activo" : "Cerrado"}
                  </span>
                </label>
              </div>

              {/* Fila de horarios — solo si está activo */}
              {day.isActive && (
                <div className="flex items-center gap-2 pl-0 sm:pl-26">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">Desde</label>
                    <input type="time"
                      defaultValue={day.startTime}
                      onBlur={(e) => upsertDay.mutate({
                        dayOfWeek: day.dayOfWeek, isActive: true,
                        startTime: e.target.value, endTime: day.endTime,
                      })}
                      className="form-input text-sm w-full"
                    />
                  </div>
                  <div className="text-gray-300 mt-5">→</div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">Hasta</label>
                    <input type="time"
                      defaultValue={day.endTime}
                      onBlur={(e) => upsertDay.mutate({
                        dayOfWeek: day.dayOfWeek, isActive: true,
                        startTime: day.startTime, endTime: e.target.value,
                      })}
                      className="form-input text-sm w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Excepciones */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Excepciones / Feriados</span>
          <button onClick={() => setShowExcForm(!showExcForm)} className="btn btn-outline btn-sm">
            {showExcForm ? "✕ Cancelar" : "+ Agregar"}
          </button>
        </div>

        {showExcForm && (
          <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
            <form onSubmit={handleExc(onSubmitException)} className="space-y-3">
              {/* Fecha + Tipo en la misma fila */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Fecha</label>
                  <input type="date" {...regExc("date", { required: true })} className="form-input text-sm" />
                </div>
                <div>
                  <label className="form-label">Tipo</label>
                  <select {...regExc("isClosed", { setValueAs: (v) => v === "true" })} className="form-select text-sm">
                    <option value="true">Día cerrado</option>
                    <option value="false">Horario especial</option>
                  </select>
                </div>
              </div>

              {/* Horarios solo si es día especial */}
              {(isClosedVal === false || isClosedVal === "false" as any) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Desde</label>
                    <input type="time" {...regExc("customStartTime")} className="form-input text-sm" />
                  </div>
                  <div>
                    <label className="form-label">Hasta</label>
                    <input type="time" {...regExc("customEndTime")} className="form-input text-sm" />
                  </div>
                </div>
              )}

              <div>
                <label className="form-label">Motivo <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input {...regExc("reason")} className="form-input text-sm" placeholder="Ej: Feriado nacional, Vacaciones..." />
              </div>

              <button type="submit" disabled={createException.isPending} className="btn btn-primary w-full">
                {createException.isPending ? "Guardando..." : "Guardar excepción"}
              </button>
            </form>
          </div>
        )}

        {exceptions.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">
            <div className="text-3xl mb-2">📅</div>
            No hay excepciones cargadas
          </div>
        ) : (
          exceptions.map((exc) => (
            <div key={exc.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-700">{exc.date}</div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`badge ${exc.isClosed ? "badge-red" : "badge-blue"}`}>
                    {exc.isClosed ? "🔒 Cerrado" : `⏰ ${exc.customStartTime} → ${exc.customEndTime}`}
                  </span>
                  {exc.reason && <span className="text-xs text-gray-400">{exc.reason}</span>}
                </div>
              </div>
              <button onClick={() => deleteException.mutate(exc.id)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 flex-shrink-0">
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};