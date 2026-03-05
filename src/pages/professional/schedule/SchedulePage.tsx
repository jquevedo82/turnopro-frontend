/**
 * SchedulePage.tsx — Configuración de la agenda del profesional.
 * Plantilla semanal + excepciones.
 */
import { useMySchedule, useExceptions, useUpsertDay, useCreateException, useDeleteException } from "@/hooks/useSchedule";
import { PageLoader } from "@/components/ui/Spinner";
import { DAYS_ES } from "@/utils/dates";
import { useForm } from "react-hook-form";
import { useState } from "react";

const DEFAULT_DAYS = [0,1,2,3,4,5,6].map((d) => ({ dayOfWeek: d, startTime: "08:00", endTime: "13:00", isActive: false }));

export const SchedulePage = () => {
  const { data: schedule = [], isLoading } = useMySchedule();
  const { data: exceptions = [] } = useExceptions();
  const upsertDay      = useUpsertDay();
  const createException = useCreateException();
  const deleteException = useDeleteException();
  const [showExcForm, setShowExcForm] = useState(false);

  const { register: regExc, handleSubmit: handleExc, reset: resetExc } = useForm<{ date: string; isClosed: boolean; customStartTime?: string; customEndTime?: string; reason?: string }>();

  const days = DEFAULT_DAYS.map((def) => schedule.find((s) => s.dayOfWeek === def.dayOfWeek) ?? def);

  const onSubmitException = async (data: any) => {
    await createException.mutateAsync(data);
    resetExc(); setShowExcForm(false);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="page">
      <h1 className="page-title mb-6">🕐 Configuración de Horarios</h1>

      {/* Plantilla semanal */}
      <div className="card mb-6">
        <div className="card-header"><span className="card-title">Plantilla semanal</span></div>
        <div className="divide-y divide-gray-100">
          {days.map((day) => (
            <div key={day.dayOfWeek} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-24 text-sm font-semibold text-gray-700">{DAYS_ES[day.dayOfWeek]}</div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={day.isActive}
                  onChange={(e) => upsertDay.mutate({ dayOfWeek: day.dayOfWeek, isActive: e.target.checked, startTime: day.startTime, endTime: day.endTime })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-xs text-gray-400">{day.isActive ? "Activo" : "Cerrado"}</span>
              </label>
              {day.isActive && (
                <>
                  <input type="time" defaultValue={day.startTime}
                    onBlur={(e) => upsertDay.mutate({ dayOfWeek: day.dayOfWeek, isActive: true, startTime: e.target.value, endTime: day.endTime })}
                    className="form-input w-28 text-sm" />
                  <span className="text-gray-400 text-sm">→</span>
                  <input type="time" defaultValue={day.endTime}
                    onBlur={(e) => upsertDay.mutate({ dayOfWeek: day.dayOfWeek, isActive: true, startTime: day.startTime, endTime: e.target.value })}
                    className="form-input w-28 text-sm" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Excepciones */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Excepciones / Días especiales</span>
          <button onClick={() => setShowExcForm(!showExcForm)} className="btn btn-outline btn-sm">
            {showExcForm ? "✕ Cancelar" : "+ Agregar excepción"}
          </button>
        </div>

        {showExcForm && (
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
            <form onSubmit={handleExc(onSubmitException)} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="form-label">Fecha</label>
                <input type="date" {...regExc("date", { required: true })} className="form-input text-sm" />
              </div>
              <div>
                <label className="form-label">Tipo</label>
                <select {...regExc("isClosed")} className="form-select text-sm">
                  <option value="true">Día cerrado</option>
                  <option value="false">Horario especial</option>
                </select>
              </div>
              <div>
                <label className="form-label">Inicio (si especial)</label>
                <input type="time" {...regExc("customStartTime")} className="form-input text-sm" />
              </div>
              <div>
                <label className="form-label">Motivo</label>
                <input {...regExc("reason")} className="form-input text-sm" placeholder="Ej: Feriado" />
              </div>
              <div className="col-span-2 sm:col-span-4">
                <button type="submit" className="btn btn-primary btn-sm">Guardar excepción</button>
              </div>
            </form>
          </div>
        )}

        {exceptions.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No hay excepciones cargadas</div>
        ) : (
          exceptions.map((exc) => (
            <div key={exc.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0">
              <div className="text-sm font-semibold text-gray-700 w-28">{exc.date}</div>
              <div className="flex-1">
                <span className={`badge ${exc.isClosed ? "badge-red" : "badge-blue"}`}>
                  {exc.isClosed ? "Cerrado" : `${exc.customStartTime} → ${exc.customEndTime}`}
                </span>
                {exc.reason && <span className="text-xs text-gray-400 ml-2">{exc.reason}</span>}
              </div>
              <button onClick={() => deleteException.mutate(exc.id)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
