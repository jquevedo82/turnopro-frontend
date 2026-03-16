import { api } from "@/config/api";
import type { Appointment } from "@/types";

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

  confirmForProfessional:  (id: number, professionalId: number) =>
    api.post<Appointment>(`/appointments/${id}/confirm`,     {}, { params: { professionalId } }).then((r) => r.data),

  completeForProfessional: (id: number, professionalId: number) =>
    api.post<Appointment>(`/appointments/${id}/complete`,    {}, { params: { professionalId } }).then((r) => r.data),

  cancelForProfessional:   (id: number, professionalId: number) =>
    api.post<Appointment>(`/appointments/${id}/cancel`,      {}, { params: { professionalId } }).then((r) => r.data),

  sendReminderForProfessional: (id: number, professionalId: number) =>
    api.post<Appointment>(`/appointments/${id}/resend-email`, {}, { params: { professionalId } }).then((r) => r.data),

  createForProfessional: (
    data: {
      professionalId: number; serviceId: number; date: string; startTime: string;
      clientName: string; clientEmail: string; clientPhone: string; notes?: string;
    },
    professionalId: number,
  ) => api.post<Appointment>("/appointments", data, { params: { professionalId } }).then((r) => r.data),
};
