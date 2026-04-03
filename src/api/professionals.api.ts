import { api } from "@/config/api";
import type { Professional } from "@/types";

export const professionalsApi = {
  // Superadmin
  getAll:     () => api.get<Professional[]>("/professionals").then((r) => r.data),
  getOne:     (id: number) => api.get<Professional>(`/professionals/${id}`).then((r) => r.data),
  create:     (data: Partial<Professional>) => api.post<Professional>("/professionals", data).then((r) => r.data),
  update:     (id: number, data: Partial<Professional>) => api.patch<Professional>(`/professionals/${id}`, data).then((r) => r.data),
  activate:   (id: number, subscriptionEnd: string) => api.post<Professional>(`/professionals/${id}/activate`, { subscriptionEnd }).then((r) => r.data),
  deactivate: (id: number) => api.post<Professional>(`/professionals/${id}/deactivate`).then((r) => r.data),

  shareLink:  (email: string) => api.post('/professionals/share-link', { email }).then((r) => r.data),

  // Profesional autenticado — usa /me, no necesita id
  getMe:      () => api.get<Professional>("/professionals/me").then((r) => r.data),
  updateMe:   (data: Partial<Professional>) => api.patch<Professional>("/professionals/me", data).then((r) => r.data),
};
