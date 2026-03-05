import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleApi } from "@/api/schedule.api";

export const useMySchedule = () =>
  useQuery({ queryKey: ["schedule", "my"], queryFn: scheduleApi.getMy });

export const useExceptions = () =>
  useQuery({ queryKey: ["schedule", "exceptions"], queryFn: scheduleApi.getExceptions });

export const useUpsertDay = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: scheduleApi.upsertDay, onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }) });
};

export const useCreateException = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: scheduleApi.createException, onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }) });
};

export const useDeleteException = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: scheduleApi.deleteException, onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }) });
};
