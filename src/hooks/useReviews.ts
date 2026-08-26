/**
 * useReviews.ts — Custom hooks para reseñas con React Query.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "@/api/reviews.api";
import toast from "../utils/toast";

export const useReviewByToken = (token: string) =>
  useQuery({ queryKey: ["review", token], queryFn: () => reviewsApi.getByToken(token), enabled: !!token });

export const useSubmitReview = () =>
  useMutation({
    mutationFn: ({ token, rating, comment }: { token: string; rating: number; comment: string }) =>
      reviewsApi.submit(token, { rating, comment }),
  });

export const useMyReviews = () =>
  useQuery({ queryKey: ["reviews"], queryFn: reviewsApi.list });

export const useApproveReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewsApi.approve(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reviews"] }); toast.success("Reseña publicada"); },
  });
};

export const useRejectReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewsApi.reject(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reviews"] }); toast.success("Reseña rechazada"); },
  });
};

export const usePublicReviews = (slug: string) =>
  useQuery({ queryKey: ["public-reviews", slug], queryFn: () => reviewsApi.getPublicReviews(slug), enabled: !!slug });
