/**
 * AdminDashboard.tsx — Panel principal del superadmin.
 * Muestra resumen de profesionales activos, inactivos y próximos a vencer.
 */
import { useProfessionals } from "@/hooks/useProfessionals";
import { PageLoader } from "@/components/ui/Spinner";
import { formatDateShort } from "@/utils/dates";
import { useNavigate } from "react-router-dom";

export const AdminDashboard = () => {
  const { data: professionals = [], isLoading } = useProfessionals();
  const navigate = useNavigate();

  if (isLoading) return <PageLoader />;

  const active   = professionals.filter((p) => p.isActive).length;
  const inactive = professionals.filter((p) => !p.isActive).length;
  const today    = new Date();

  // Próximos a vencer: activos con subscriptionEnd en los próximos 7 días
  const expiringSoon = professionals.filter((p) => {
    if (!p.isActive || !p.subscriptionEnd) return false;
    const end  = new Date(p.subscriptionEnd);
    const diff = (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  return (
    <div className="page">
      <div className="section-hd">
        <h1 className="page-title">📊 Dashboard</h1>
        <button onClick={() => navigate("/admin/profesionales")} className="btn btn-primary btn-sm">
          + Nuevo profesional
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{professionals.length}</div>
          <div className="stat-sub">profesionales</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Activos</div>
          <div className="stat-value text-emerald-600">{active}</div>
          <div className="stat-sub">con suscripción vigente</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inactivos</div>
          <div className="stat-value text-red-500">{inactive}</div>
          <div className="stat-sub">sin suscripción</div>
        </div>
      </div>

      {/* Alertas de vencimiento */}
      {expiringSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-bold text-amber-800 mb-3">⚠️ Suscripciones por vencer</h3>
          <div className="space-y-2">
            {expiringSoon.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-amber-900 font-medium">{p.name}</span>
                <span className="text-amber-700">vence el {formatDateShort(p.subscriptionEnd!)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista reciente */}
      <div className="card">
        <div className="card-header"><span className="card-title">Últimos profesionales</span></div>
        {professionals.slice(0, 8).map((p) => (
          <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-violet-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {p.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900">{p.name}</div>
              <div className="text-xs text-gray-400">{p.profession} · {p.email}</div>
            </div>
            <div className="flex items-center gap-2">
              {p.subscriptionEnd && <span className="text-xs text-gray-400">hasta {formatDateShort(p.subscriptionEnd)}</span>}
              <span className={`badge ${p.isActive ? "badge-green" : "badge-red"}`}>
                {p.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
