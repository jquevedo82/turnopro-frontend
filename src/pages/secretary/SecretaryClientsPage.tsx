/**
 * SecretaryClientsPage.tsx
 * Lista de clientes del profesional activo.
 * Igual que ClientsPage pero pide los clientes por professionalId.
 */
import { useQuery } from "@tanstack/react-query";
import { useActiveProfessional } from "@/store/auth.store";
import { api } from "@/config/api";
import { PageLoader } from "@/components/ui/Spinner";
import { formatDateShort } from "@/utils/dates";
import type { Client } from "@/types";

export const SecretaryClientsPage = () => {
  const activeProfessional = useActiveProfessional();
  const professionalId     = activeProfessional?.id ?? 0;

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["clients", "forProfessional", professionalId],
    queryFn:  () => api.get(`/clients?professionalId=${professionalId}`).then(r => r.data),
    enabled:  !!professionalId,
  });

  // Guard: sin profesional activo
  if (!activeProfessional) {
    return (
      <div className="page">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="font-semibold text-amber-800">Seleccioná un profesional primero</p>
          <p className="text-sm text-amber-600 mt-1">
            Usá el selector "Trabajando como..." en la barra lateral para elegir el profesional.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="page">
      <div className="section-hd">
        <div>
          <h1 className="page-title">👥 Clientes</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Pacientes de <span className="font-medium text-gray-600">{activeProfessional.name}</span>
          </p>
        </div>
        <span className="text-sm text-gray-400">{clients.length} registrados</span>
      </div>

      <div className="card">
        {clients.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">👥</div>
            <p>Los clientes de {activeProfessional.name} aparecerán aquí después de su primera reserva</p>
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
