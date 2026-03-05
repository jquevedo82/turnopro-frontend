import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/api/public.api";

export const usePublicProfile = (slug: string) =>
  useQuery({ queryKey: ["public", slug], queryFn: () => publicApi.getProfile(slug), enabled: !!slug });

export const usePublicServices = (slug: string) =>
  useQuery({ queryKey: ["public", slug, "services"], queryFn: () => publicApi.getServices(slug), enabled: !!slug });
