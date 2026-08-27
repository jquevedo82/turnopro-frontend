import { api } from "@/config/api";
import type { PaginatedClients } from "@/types";

const PAGE_SIZE = 50;

export const clientsApi = {
  // Panel profesional — usa /clients/my con el JWT
  getMy: (page = 1) =>
    api.get<PaginatedClients>("/clients/my", { params: { page, limit: PAGE_SIZE } }).then((r) => r.data),

  // Panel secretaria — usa /clients?professionalId=X
  // El backend valida que la secretaria tenga acceso a ese profesional
  getForProfessional: (professionalId: number, page = 1) =>
    api.get<PaginatedClients>("/clients", { params: { professionalId, page, limit: PAGE_SIZE } }).then((r) => r.data),
};