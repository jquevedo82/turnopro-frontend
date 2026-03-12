import { useQuery } from "@tanstack/react-query";
import { availabilityApi } from "@/api/availability.api";

export const useSlots = (professionalId: number, date: string, serviceId?: number) =>
  useQuery({
    queryKey:  ["slots", professionalId, date, serviceId],
    queryFn:   () => availabilityApi.getSlots(professionalId, date, serviceId),
    enabled:   !!date && !!professionalId,
    staleTime: 30_000, // 30 segundos — los slots cambian frecuentemente
  });

export const useAvailableDays = (
  professionalId: number,
  year: number,
  month: number,
  serviceId?: number,   // ← agregado
) =>
  useQuery({
    queryKey: ["available-days", professionalId, year, month, serviceId], // ← serviceId en la key para refetch al cambiar servicio
    queryFn:  () => availabilityApi.getAvailableDays(professionalId, year, month, serviceId),
    enabled:  !!professionalId,
  });