import { api } from "@/config/api";

export const availabilityApi = {
  getSlots: (professionalId: number, date: string, serviceId?: number) =>
    api.get<string[]>(`/availability/${professionalId}/${date}`, {
      params: serviceId ? { serviceId } : {},
    }).then((r) => r.data),

  getAvailableDays: (professionalId: number, year: number, month: number) =>
    api.get<string[]>(`/availability/${professionalId}/month/${year}/${month}`).then((r) => r.data),
};
