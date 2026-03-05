import { useQuery } from "@tanstack/react-query";
import { availabilityApi } from "@/api/availability.api";

export const useSlots = (professionalId: number, date: string, serviceId?: number) =>
  useQuery({
    queryKey:  ["slots", professionalId, date, serviceId],
    queryFn:   () => availabilityApi.getSlots(professionalId, date, serviceId),
    enabled:   !!date && !!professionalId,
    staleTime: 30_000, // 30 segundos — los slots cambian frecuentemente
  });

export const useAvailableDays = (professionalId: number, year: number, month: number) =>
  useQuery({
    queryKey: ["available-days", professionalId, year, month],
    queryFn:  () => availabilityApi.getAvailableDays(professionalId, year, month),
    enabled:  !!professionalId,
  });
