import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { MonthlyStats } from '@/types';

vi.mock('@/api/appointments.api', () => ({
  appointmentsApi: { getStats: vi.fn() },
}));

vi.mock('@/store/auth.store', () => ({
  useCurrentUser: () => ({ professionalType: 'health' }),
}));

import { appointmentsApi } from '@/api/appointments.api';
import { StatsPage } from './StatsPage';

const stats: MonthlyStats = {
  month: '2026-08', completed: 12, cancelled: 3, noShow: 2, noShowRate: 14,
  topService: { name: 'Consulta general', count: 8 },
};

const renderPage = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <StatsPage />
    </QueryClientProvider>,
  );
};

describe('StatsPage', () => {
  it('muestra las estadísticas del mes con la terminología del vertical', async () => {
    vi.mocked(appointmentsApi.getStats).mockResolvedValueOnce(stats);

    renderPage();

    await waitFor(() => expect(screen.getByText('agosto 2026')).toBeInTheDocument());
    expect(screen.getByText('Citas atendidas')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('14%')).toBeInTheDocument();
    expect(screen.getByText('Consulta general')).toBeInTheDocument();
  });

  it('muestra un mensaje si todavía no hay servicio destacado en el mes', async () => {
    vi.mocked(appointmentsApi.getStats).mockResolvedValueOnce({ ...stats, topService: null });

    renderPage();

    await waitFor(() => expect(screen.getByText(/no hay datos suficientes/i)).toBeInTheDocument());
  });

  it('muestra un error (no un spinner infinito) si la consulta falla', async () => {
    // Bug real reportado 2026-09-03: antes de este fix, un error acá dejaba el
    // spinner girando para siempre porque isLoading pasaba a false pero stats
    // seguía undefined, y la condición no distinguía "falló" de "sin datos".
    vi.mocked(appointmentsApi.getStats).mockRejectedValueOnce(new Error('Network Error'));

    renderPage();

    await waitFor(() => expect(screen.getByText(/no se pudieron cargar/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });
});
