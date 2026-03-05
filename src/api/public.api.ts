import { api } from "@/config/api";
import type { Professional, Service } from "@/types";

export const publicApi = {
  getProfile:  (slug: string) => api.get<Professional>(`/public/${slug}`).then((r) => r.data),
  getServices: (slug: string) => api.get<Service[]>(`/public/${slug}/services`).then((r) => r.data),
};
