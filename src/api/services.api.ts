import { api } from "@/config/api";
import type { Service } from "@/types";

export const servicesApi = {
  getMy:   () => api.get<Service[]>("/services/my").then((r) => r.data),
  create:  (data: Partial<Service>) => api.post<Service>("/services", data).then((r) => r.data),
  update:  (id: number, data: Partial<Service>) => api.patch<Service>(`/services/${id}`, data).then((r) => r.data),
  deactivate: (id: number) => api.delete<Service>(`/services/${id}`).then((r) => r.data),
};
