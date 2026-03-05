import { api } from "@/config/api";
import type { Plan } from "@/types";
export const plansApi = {
  getAll:  () => api.get<Plan[]>("/plans").then((r) => r.data),
  create:  (data: Partial<Plan>) => api.post<Plan>("/plans", data).then((r) => r.data),
  update:  (id: number, data: Partial<Plan>) => api.put<Plan>(`/plans/${id}`, data).then((r) => r.data),
};
