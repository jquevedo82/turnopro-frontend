/**
 * SecretaryClientsPage.tsx
 * Lista de clientes del profesional activo.
 * Responsivo mobile-first — misma estructura que ClientsPage del profesional.
 */
import { useQuery }    from "@tanstack/react-query";
import { useAuthStore, useActiveProfessional } from "@/store/auth.store";
import { clientsApi }  from "@/api/clients.api";
import { PageLoader }  from "@/components/ui/Spinner";
import { formatDateShort } from "@/utils/dates";
import { useVerticalConfig } from "@/hooks/useVerticalConfig";

export const SecretaryClientsPage = () => {
  const activeProfessionalId = useAuthStore((s) => s.activeProfessionalId);
  const activeProfessional   = useActiveProfessional();
  const vc = useVerticalConfig(activeProfessional?.professionalType);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients", activeProfessionalId],
    queryFn:  () => clientsApi.getForProfessional(activeProfessionalId!),
    enabled:  !!activeProfessionalId,
  });

  if (!activeProfessionalId) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p className="text-4xl mb-3">👆</p>
        <p className="font-medium text-gray-600">Seleccioná un profesional primero</p>
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
            {vc.clientLabelPlural} de{" "}
            <span className="font-medium text-gray-600">{activeProfessional?.name}</span>
          </p>
        </div>
        <span className="text-sm text-gray-400">{clients.length} registrados</span>
      </div>

      <div className="card">
        {clients.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-sm">
              Los clientes de {activeProfessional?.name} aparecerán aquí
            </p>
          </div>
        ) : (
          clients.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0">
              {/* Avatar */}
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center
                              text-blue-700 text-sm font-bold flex-shrink-0">
                {c.name.charAt(0).toUpperCase()}
              </div>

              {/* Info — apilada en mobile, en fila en desktop */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{c.name}</div>
                <div className="flex flex-col sm:flex-row sm:gap-3 mt-0.5">
                  <span className="text-xs text-gray-400 truncate">📧 {c.email}</span>
                  <span className="text-xs text-gray-400">📱 {c.phone}</span>
                </div>
              </div>

              {/* Fecha — solo visible en sm+ */}
              <div className="hidden sm:block text-xs text-gray-400 flex-shrink-0">
                desde {formatDateShort(c.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};