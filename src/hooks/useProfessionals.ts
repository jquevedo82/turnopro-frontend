import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalsApi } from "@/api/professionals.api";
import toast from "@/utils/toast";

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

export const useUpdateProfessional = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<import("@/types").Professional> }) =>
      professionalsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["professionals"] });
      toast.success("Profesional actualizado");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Error al actualizar el profesional";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
};
