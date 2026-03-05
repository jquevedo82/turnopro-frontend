import { api } from "@/config/api";
import type { Client } from "@/types";
export const clientsApi = { getMy: () => api.get<Client[]>("/clients/my").then((r) => r.data) };
