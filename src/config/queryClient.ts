import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos — datos considerados frescos
      retry:     1,              // Reintenta 1 vez en caso de error
      refetchOnWindowFocus: false,
    },
  },
});
