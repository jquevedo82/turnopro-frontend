/**
 * StatsPage.tsx — Estadísticas del mes en curso.
 * Datos ya existían en appointments (status, service) — GET /appointments/stats
 * agrega solo el agregado, sin tabla nueva.
 */
import { useStats } from "@/hooks/useAppointments";
import { PageLoader } from "@/components/ui/Spinner";
import { useVerticalConfig } from "@/hooks/useVerticalConfig";

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const formatMonth = (ym: string) => {
  const [year, month] = ym.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
};

export const StatsPage = () => {
  const { data: stats, isLoading, isError, error, refetch } = useStats();
  const vc = useVerticalConfig();

  if (isLoading) return <PageLoader />;

  // Antes de este fix, un error acá (401/403/500/red caída) dejaba el spinner
  // girando para siempre — isLoading pasaba a false pero stats seguía undefined,
  // así que "cargando o sin datos" nunca distinguía "falló" de "todavía no llegó".
  if (isError || !stats) {
    return (
      <div className="page">
        <div className="section-hd">
          <h1 className="page-title">📊 Estadísticas</h1>
        </div>
        <div className="card py-12 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-gray-600 font-medium">No se pudieron cargar las estadísticas</p>
          {error && <p className="text-xs text-gray-400 mt-1">{(error as any)?.response?.data?.message || (error as Error).message}</p>}
          <button onClick={() => refetch()} className="btn btn-outline btn-sm mt-4">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="section-hd">
        <div>
          <h1 className="page-title">📊 Estadísticas</h1>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">{formatMonth(stats.month)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className="stat-card">
          <div className="stat-label">{vc.appointmentLabelPlural} atendidas</div>
          <div className="stat-value text-emerald-600">{stats.completed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Canceladas</div>
          <div className="stat-value text-red-500">{stats.cancelled}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tasa de no-show</div>
          <div className="stat-value text-amber-600">{stats.noShowRate}%</div>
          <div className="stat-sub">{stats.noShow} {vc.clientLabelPlural.toLowerCase()} no se presentaron</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Servicio más solicitado</span></div>
        <div className="px-5 py-6 text-center">
          {stats.topService ? (
            <>
              <div className="text-2xl font-bold text-gray-900">{stats.topService.name}</div>
              <p className="text-sm text-gray-400 mt-1">{stats.topService.count} {stats.topService.count === 1 ? "vez" : "veces"} este mes</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Todavía no hay datos suficientes este mes</p>
          )}
        </div>
      </div>
    </div>
  );
};
