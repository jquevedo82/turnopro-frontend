import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "@/api/clients.api";
import { PageLoader } from "@/components/ui/Spinner";
import { formatDateShort } from "@/utils/dates";

export const ClientsPage = () => {
  const { data: clients = [], isLoading } = useQuery({ queryKey: ["clients"], queryFn: clientsApi.getMy });

  if (isLoading) return <PageLoader />;

  return (
    <div className="page">
      <div className="section-hd">
        <h1 className="page-title">👥 Clientes</h1>
        <span className="text-sm text-gray-400">{clients.length} registrados</span>
      </div>
      <div className="card">
        {clients.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">👥</div>
            <p>Tus clientes aparecerán aquí después de su primera reserva</p>
          </div>
        ) : (
          clients.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-bold flex-shrink-0">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-400">{c.email} · 📱 {c.phone}</div>
              </div>
              <div className="text-xs text-gray-400">desde {formatDateShort(c.createdAt)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
