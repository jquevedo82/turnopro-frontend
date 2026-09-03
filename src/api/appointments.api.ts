import { api } from "@/config/api";
import type { Appointment, AppointmentStatus, MonthlyStats, PublicQueueEntry } from "@/types";

export const appointmentsApi = {
  create: (data: {
    professionalId: number; serviceId: number; date: string; startTime: string;
    clientName: string; clientEmail: string; clientPhone: string; notes?: string;
  }) => api.post<Appointment>("/appointments", data).then((r) => r.data),

  getByToken:       (token: string) => api.get<Appointment>(`/appointments/token/${token}`).then((r) => r.data),
  cancelByToken:    (token: string) => api.post<Appointment>(`/appointments/token/${token}/cancel`).then((r) => r.data),
  reconfirmByToken: (token: string) => api.post<Appointment>(`/appointments/token/${token}/reconfirm`).then((r) => r.data),

  getToday:    (date?: string) => api.get<Appointment[]>("/appointments/today",    { params: { date } }).then((r) => r.data),
  getTomorrow: ()              => api.get<Appointment[]>("/appointments/tomorrow").then((r) => r.data),
  getUpcoming: (status?: AppointmentStatus) => api.get<Appointment[]>("/appointments/upcoming", { params: { status } }).then((r) => r.data),
  getStats:    ()              => api.get<MonthlyStats>("/appointments/stats").then((r) => r.data),

  // ── Superadmin ──────────────────────────────────────────────────────────────
  getAdminStats: () => api.get<{ totalCompleted: number }>("/appointments/admin-stats").then((r) => r.data),

  confirm:     (id: number) => api.post<Appointment>(`/appointments/${id}/confirm`).then((r) => r.data),
  complete:    (id: number) => api.post<Appointment>(`/appointments/${id}/complete`).then((r) => r.data),
  cancel:      (id: number) => api.post<Appointment>(`/appointments/${id}/cancel`).then((r) => r.data),
  markReminder:(id: number) => api.post<Appointment>(`/appointments/${id}/reminder`).then((r) => r.data),
  sendReminder:(id: number) => api.post<Appointment>(`/appointments/${id}/resend-email`).then((r) => r.data),

  // ── Variantes para secretaria — pasan professionalId como query param ─────
  // El backend valida que la secretaria tenga acceso a ese profesional.
  getTodayForProfessional: (professionalId: number, date?: string) =>
    api.get<Appointment[]>("/appointments/today",    { params: { date, professionalId } }).then((r) => r.data),

  getTomorrowForProfessional: (professionalId: number) =>
    api.get<Appointment[]>("/appointments/tomorrow", { params: { professionalId } }).then((r) => r.data),

  getUpcomingForProfessional: (professionalId: number, status?: AppointmentStatus) =>
    api.get<Appointment[]>("/appointments/upcoming", { params: { professionalId, status } }).then((r) => r.data),

  confirmForProfessional:  (id: number, professionalId: number) =>
    api.post<Appointment>(`/appointments/${id}/confirm`,     {}, { params: { professionalId } }).then((r) => r.data),

  completeForProfessional: (id: number, professionalId: number) =>
    api.post<Appointment>(`/appointments/${id}/complete`,    {}, { params: { professionalId } }).then((r) => r.data),

  cancelForProfessional:   (id: number, professionalId: number) =>
    api.post<Appointment>(`/appointments/${id}/cancel`,      {}, { params: { professionalId } }).then((r) => r.data),

  sendReminderForProfessional: (id: number, professionalId: number) =>
    api.post<Appointment>(`/appointments/${id}/resend-email`, {}, { params: { professionalId } }).then((r) => r.data),

  markReminderForProfessional: (id: number, professionalId: number) =>
    api.post<Appointment>(`/appointments/${id}/reminder`, {}, { params: { professionalId } }).then((r) => r.data),

  createForProfessional: (
    data: {
      professionalId: number; serviceId: number; date: string; startTime: string;
      clientName: string; clientEmail: string; clientPhone: string; notes?: string;
    },
    professionalId: number,
  ) => api.post<Appointment>("/appointments", data, { params: { professionalId } }).then((r) => r.data),

  // ── Sala de espera ─────────────────────────────────────────────────────────
  markArrived: (id: number) =>
    api.post<Appointment>(`/appointments/${id}/arrived`).then((r) => r.data),

  startConsultation: (id: number) =>
    api.post<Appointment>(`/appointments/${id}/start`).then((r) => r.data),

  getQueue: (date?: string) =>
    api.get<Appointment[]>("/appointments/queue", { params: { date } }).then((r) => r.data),

  markArrivedForProfessional: (id: number, professionalId: number) =>
    api.post<Appointment>(`/appointments/${id}/arrived`, {}, { params: { professionalId } }).then((r) => r.data),

  startConsultationForProfessional: (id: number, professionalId: number) =>
    api.post<Appointment>(`/appointments/${id}/start`, {}, { params: { professionalId } }).then((r) => r.data),

  getQueueForProfessional: (professionalId: number, date?: string) =>
    api.get<Appointment[]>("/appointments/queue", { params: { date, professionalId } }).then((r) => r.data),

  // ── Pantalla pública sala de espera ────────────────────────────────────────
  getPublicQueue: (slug: string, date?: string) =>
    api.get<PublicQueueEntry[]>(`/public/${slug}/queue`, { params: { date } }).then((r) => r.data),

  getQueueVersion: (slug: string) =>
    api.get<{ queueUpdatedAt: string | null }>(`/public/${slug}/queue-version`).then((r) => r.data),
};
