/**
 * useAppointments.ts — Custom hooks para citas con React Query.
 * Para agregar una nueva consulta: crear un nuevo useQuery aquí.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi } from "@/api/appointments.api";
import toast from "../utils/toast";

// ── Hooks para el panel profesional (sin cambios) ─────────────────────────────

export const useToday = (date?: string) =>
  useQuery({ queryKey: ["appointments", "today", date], queryFn: () => appointmentsApi.getToday(date) });

export const useTomorrow = () =>
  useQuery({ queryKey: ["appointments", "tomorrow"], queryFn: appointmentsApi.getTomorrow });

export const useStats = () =>
  useQuery({ queryKey: ["appointments", "stats"], queryFn: appointmentsApi.getStats });

export const useAdminStats = () =>
  useQuery({ queryKey: ["appointments", "admin-stats"], queryFn: appointmentsApi.getAdminStats });

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

export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["slots"] });
    },
  });
};

export const useSendReminder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.sendReminder(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); toast.success("Recordatorio enviado"); },
    onError: () => toast.error("Error al enviar"),
  });
};

// ── Hooks para el panel secretaria — reciben professionalId explícito ─────────
// queryKey incluye professionalId para que cada profesional tenga su propia cache.

export const useTodayForProfessional = (professionalId: number | null, date?: string) =>
  useQuery({
    queryKey: ["appointments", "today", date, professionalId],
    queryFn:  () => appointmentsApi.getTodayForProfessional(professionalId!, date),
    enabled:  !!professionalId,
  });

export const useTomorrowForProfessional = (professionalId: number | null) =>
  useQuery({
    queryKey: ["appointments", "tomorrow", professionalId],
    queryFn:  () => appointmentsApi.getTomorrowForProfessional(professionalId!),
    enabled:  !!professionalId,
  });

export const useConfirmForProfessional = (professionalId: number | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.confirmForProfessional(id, professionalId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); toast.success("Cita confirmada"); },
  });
};

export const useCancelForProfessional = (professionalId: number | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.cancelForProfessional(id, professionalId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); toast.success("Cita cancelada"); },
  });
};

export const useCompleteForProfessional = (professionalId: number | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.completeForProfessional(id, professionalId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); toast.success("Cita completada"); },
  });
};

export const useMarkReminderForProfessional = (professionalId: number | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.markReminderForProfessional(id, professionalId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments", "tomorrow"] }),
  });
};

export const useCreateAppointmentForProfessional = (professionalId: number | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof appointmentsApi.createForProfessional>[0]) =>
      appointmentsApi.createForProfessional(data, professionalId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["slots"] });
    },
  });
};

// ── Sala de espera — panel profesional ────────────────────────────────────────

export const useQueue = (date?: string) =>
  useQuery({
    queryKey: ["queue", date],
    queryFn:  () => appointmentsApi.getQueue(date),
    staleTime: 0, // siempre revalida — la cola cambia frecuentemente
  });

export const useQueueForProfessional = (professionalId: number | null, date?: string) =>
  useQuery({
    queryKey: ["queue", date, professionalId],
    queryFn:  () => appointmentsApi.getQueueForProfessional(professionalId!, date),
    enabled:  !!professionalId,
    staleTime: 0,
  });

export const useMarkArrived = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.markArrived(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["queue"] }); qc.invalidateQueries({ queryKey: ["appointments"] }); },
    onError: () => toast.error("Error al registrar llegada"),
  });
};

export const useStartConsultation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.startConsultation(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["queue"] }); qc.invalidateQueries({ queryKey: ["appointments"] }); },
    onError: () => toast.error("Error al iniciar consulta"),
  });
};

export const useMarkArrivedForProfessional = (professionalId: number | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.markArrivedForProfessional(id, professionalId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["queue"] }); qc.invalidateQueries({ queryKey: ["appointments"] }); },
    onError: () => toast.error("Error al registrar llegada"),
  });
};

export const useStartConsultationForProfessional = (professionalId: number | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.startConsultationForProfessional(id, professionalId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["queue"] }); qc.invalidateQueries({ queryKey: ["appointments"] }); },
    onError: () => toast.error("Error al iniciar consulta"),
  });
};
