import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalsApi } from "@/api/professionals.api";

export const useProfessionals = () =>
  useQuery({ queryKey: ["professionals"], queryFn: professionalsApi.getAll });

export const useCreateProfessional = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: professionalsApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ["professionals"] }) });
};

export const useActivateProfessional = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, subscriptionEnd }: { id: number; subscriptionEnd: string }) =>
      professionalsApi.activate(id, subscriptionEnd),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["professionals"] }),
  });
};

export const useDeactivateProfessional = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: professionalsApi.deactivate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["professionals"] }),
  });
};
