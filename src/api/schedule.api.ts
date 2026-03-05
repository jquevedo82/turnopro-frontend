import { api } from "@/config/api";
import type { ProfessionalSchedule, ScheduleException } from "@/types";

export const scheduleApi = {
  getMy:          () => api.get<ProfessionalSchedule[]>("/schedule/my").then((r) => r.data),
  upsertDay:      (data: Partial<ProfessionalSchedule>) => api.put<ProfessionalSchedule>("/schedule/day", data).then((r) => r.data),
  getExceptions:  () => api.get<ScheduleException[]>("/schedule/exceptions").then((r) => r.data),
  createException:(data: Partial<ScheduleException>) => api.post<ScheduleException>("/schedule/exceptions", data).then((r) => r.data),
  deleteException:(id: number) => api.delete(`/schedule/exceptions/${id}`).then((r) => r.data),
};
