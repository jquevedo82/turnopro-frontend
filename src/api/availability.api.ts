import { api } from "@/config/api";
import { today, localNow } from "@/utils/dates";

export const availabilityApi = {
  getSlots: (professionalId: number, date: string, serviceId?: number) => {
    const params: Record<string, unknown> = {};
    if (serviceId) params.serviceId = serviceId;
    // Si la fecha pedida es hoy, enviamos la hora local para evitar desfase UTC/timezone
    if (date === today()) params.localNow = localNow();
    return api.get<string[]>(`/availability/${professionalId}/${date}`, { params }).then((r) => r.data);
  },

  getAvailableDays: (professionalId: number, year: number, month: number, serviceId?: number) =>
    api.get<string[]>(`/availability/${professionalId}/month/${year}/${month}`, {
      params: serviceId ? { serviceId } : {},
    }).then((r) => r.data),
};
