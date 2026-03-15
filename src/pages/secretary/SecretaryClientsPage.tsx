/**
 * SecretaryClientsPage.tsx
 * Lista de clientes del profesional activo.
 *
 * Para implementar: reutilizar ClientsPage del profesional,
 * pasando professionalId={activeProfessionalId} como contexto.
 */
import { useActiveProfessional } from "@/store/auth.store";

export const SecretaryClientsPage = () => {
  const activeProfessional = useActiveProfessional();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-500 mt-1">
          Pacientes de <span className="font-medium text-gray-700">{activeProfessional?.name}</span>
        </p>
      </div>

      {/* TODO: Integrar componente ClientsPage con professionalId del contexto */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        <p className="text-4xl mb-3">👥</p>
        <p className="font-medium text-gray-600">Clientes en construcción</p>
        <p className="text-sm mt-1">
          Próximamente: historial de pacientes de {activeProfessional?.name}
        </p>
      </div>
    </div>
  );
};
