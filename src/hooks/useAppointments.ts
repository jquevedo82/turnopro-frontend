/**
 * useAppointments.ts — Custom hooks para citas con React Query.
 * Para agregar una nueva consulta: crear un nuevo useQuery aquí.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi } from "@/api/appointments.api";
import toast from "../utils/toast";

export const useToday = (date?: string) =>
  useQuery({ queryKey: ["appointments", "today", date], queryFn: () => appointmentsApi.getToday(date) });

export const useTomorrow = () =>
  useQuery({ queryKey: ["appointments", "tomorrow"], queryFn: appointmentsApi.getTomorrow });

export const useAppointmentByToken = (token: string) =>
  useQuery({ queryKey: ["appointment", token], queryFn: () => appointmentsApi.getByToken(token), enabled: !!token });

export const useConfirmAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.confirm(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); toast.success("Cita confirmada"); },
  });
};

export const useCancelAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); toast.success("Cita cancelada"); },
  });
};

export const useCompleteAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.complete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); toast.success("Cita completada"); },
  });
};

export const useMarkReminder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.markReminder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments", "tomorrow"] }),
  });
};

export const useCreateAppointment = () =>
  useMutation({ mutationFn: appointmentsApi.create });

export const useSendReminder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.sendReminder(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); toast.success("Recordatorio enviado"); },
    onError: () => toast.error("Error al enviar"),
  });
};
