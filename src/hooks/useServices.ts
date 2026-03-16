import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { servicesApi } from "@/api/services.api";

export const useMyServices = () =>
  useQuery({ queryKey: ["services", "my"], queryFn: servicesApi.getMy });

export const useMyServicesT = () =>
  useQuery({ queryKey: ["services", "myTodos"], queryFn: servicesApi.getMyTodos });

export const useCreateService = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: servicesApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }) });
};

export const useUpdateService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => servicesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
};
