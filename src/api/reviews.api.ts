import { api } from "@/config/api";
import type { ReviewInvite, ReviewAdmin, PublicReview } from "@/types";

export const reviewsApi = {
  getByToken: (token: string) => api.get<ReviewInvite>(`/reviews/token/${token}`).then((r) => r.data),

  submit: (token: string, data: { rating: number; comment: string }) =>
    api.post(`/reviews/token/${token}/submit`, data).then((r) => r.data),

  list:    () => api.get<ReviewAdmin[]>("/reviews").then((r) => r.data),
  approve: (id: number) => api.patch<ReviewAdmin>(`/reviews/${id}/approve`).then((r) => r.data),
  reject:  (id: number) => api.patch<ReviewAdmin>(`/reviews/${id}/reject`).then((r) => r.data),

  getPublicReviews: (slug: string) => api.get<PublicReview[]>(`/public/${slug}/reviews`).then((r) => r.data),
};
