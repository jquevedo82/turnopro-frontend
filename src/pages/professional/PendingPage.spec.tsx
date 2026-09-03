import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Appointment } from '@/types';

vi.mock('@/api/appointments.api', () => ({
  appointmentsApi: { getPending: vi.fn(), confirm: vi.fn(), cancel: vi.fn() },
}));

vi.mock('@/store/auth.store', () => ({
  useCurrentUser: () => ({ professionalType: 'health' }),
}));

import { appointmentsApi } from '@/api/appointments.api';
import { PendingPage } from './PendingPage';

const apptSept8: Appointment = {
  id: 1, professionalId: 5, date: '2026-09-08', startTime: '10:00', status: 'pending',
  client: { id: 1, name: 'Ana López', phone: '+5491111111111' },
  service: { id: 1, name: 'Consulta', durationMinutes: 30 },
} as unknown as Appointment;

const renderPage = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <PendingPage />
    </QueryClientProvider>,
  );
};

describe('PendingPage', () => {
  it('lista las pendientes de cualquier fecha con la fecha real de cada una a la vista', async () => {
    vi.mocked(appointmentsApi.getPending).mockResolvedValueOnce([apptSept8]);

    renderPage();

    await waitFor(() => expect(screen.getByText('Ana López')).toBeInTheDocument());
    // La fecha real de la cita queda visible — el punto de esta pantalla es justamente
    // no tener que adivinar en qué día quedó guardada.
    expect(screen.getByText(/8 de septiembre|septiembre/i)).toBeInTheDocument();
  });

  it('muestra un mensaje cuando no hay pendientes', async () => {
    vi.mocked(appointmentsApi.getPending).mockResolvedValueOnce([]);

    renderPage();

    await waitFor(() => expect(screen.getByText(/no hay/i)).toBeInTheDocument());
  });

  it('muestra un error (no "no hay pendientes") si la consulta falla', async () => {
    // Bug real reportado 2026-09-03: un endpoint todavía desplegándose (404) se veía
    // IDÉNTICO a "no hay pendientes" por el fallback `data = []`. Ahora se distingue.
    vi.mocked(appointmentsApi.getPending).mockRejectedValueOnce(new Error('Not Found'));

    renderPage();

    await waitFor(() => expect(screen.getByText(/no se pudieron cargar/i)).toBeInTheDocument());
    expect(screen.queryByText(/no hay.*pendientes/i)).not.toBeInTheDocument();
  });

  it('aceptar llama a confirm con el id de la cita', async () => {
    vi.mocked(appointmentsApi.getPending).mockResolvedValue([apptSept8]);
    vi.mocked(appointmentsApi.confirm).mockResolvedValueOnce({ ...apptSept8, status: 'confirmed' });

    renderPage();

    await waitFor(() => expect(screen.getByText('Ana López')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

    await waitFor(() => expect(appointmentsApi.confirm).toHaveBeenCalledWith(1));
  });
});
