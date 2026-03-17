import { api } from "@/config/api";
import type { Client } from "@/types";

export const clientsApi = {
  // Panel profesional — usa /clients/my con el JWT
  getMy: () => api.get<Client[]>("/clients/my").then((r) => r.data),

  // Panel secretaria — usa /clients?professionalId=X
  // El backend valida que la secretaria tenga acceso a ese profesional
  getForProfessional: (professionalId: number) =>
    api.get<Client[]>("/clients", { params: { professionalId } }).then((r) => r.data),
};