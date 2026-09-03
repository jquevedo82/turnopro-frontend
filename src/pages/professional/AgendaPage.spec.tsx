import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { Appointment } from '@/types';

vi.mock('@/api/appointments.api', () => ({
  appointmentsApi: {
    getToday: vi.fn(), getPending: vi.fn(),
    confirm: vi.fn(), cancel: vi.fn(), complete: vi.fn(), markReminder: vi.fn(),
  },
}));
vi.mock('@/api/professionals.api', () => ({
  professionalsApi: { shareLink: vi.fn() },
}));

const mockUser = { name: 'Dra. García', slug: 'dra-garcia', professionalType: 'health' };
vi.mock('@/store/auth.store', () => ({
  useAuthStore: () => ({ user: mockUser, logout: vi.fn() }),
  useCurrentUser: () => mockUser,
}));

import { appointmentsApi } from '@/api/appointments.api';
import { AgendaPage } from './AgendaPage';

const todayAppt: Appointment = {
  id: 1, date: '2026-09-03', startTime: '10:00', status: 'confirmed',
  client: { id: 1, name: 'Ana López', phone: '+5491111111111' },
  service: { id: 1, name: 'Consulta', durationMinutes: 30 },
} as unknown as Appointment;

const pendingApptOtherDay: Appointment = {
  id: 2, date: '2026-09-15', startTime: '09:00', status: 'pending',
  client: { id: 2, name: 'Bruno Díaz', phone: '+5491122222222' },
  service: { id: 2, name: 'Consulta', durationMinutes: 30 },
} as unknown as Appointment;

const renderPage = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter><AgendaPage /></MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('AgendaPage — vista unificada (reemplaza Hoy/Mañana/Pendientes)', () => {
  it('muestra la agenda del día por defecto', async () => {
    vi.mocked(appointmentsApi.getToday).mockResolvedValueOnce([todayAppt]);
    vi.mocked(appointmentsApi.getPending).mockResolvedValueOnce([]);

    renderPage();

    await waitFor(() => expect(screen.getByText('Ana López')).toBeInTheDocument());
    expect(screen.getByText('📅 Agenda')).toBeInTheDocument();
  });

  it('el toggle "Pendientes" muestra citas de cualquier fecha, con la fecha visible en cada fila', async () => {
    vi.mocked(appointmentsApi.getToday).mockResolvedValue([todayAppt]);
    vi.mocked(appointmentsApi.getPending).mockResolvedValue([pendingApptOtherDay]);

    renderPage();

    await waitFor(() => expect(screen.getByText('Ana López')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /🕓 Pendientes/i }));

    await waitFor(() => expect(screen.getByText('Bruno Díaz')).toBeInTheDocument());
    expect(screen.queryByText('Ana López')).not.toBeInTheDocument();
  });

  it('el filtro de estado "Pendientes" del día oculta las citas confirmadas', async () => {
    vi.mocked(appointmentsApi.getToday).mockResolvedValue([todayAppt]);
    vi.mocked(appointmentsApi.getPending).mockResolvedValue([]);

    renderPage();

    await waitFor(() => expect(screen.getByText('Ana López')).toBeInTheDocument());
    // El chip "Pendientes" del día (no el toggle superior) filtra por status=pending;
    // como todayAppt está confirmed, debería desaparecer de la lista.
    const pendingChip = screen.getAllByText('Pendientes')[0];
    fireEvent.click(pendingChip);

    await waitFor(() => expect(screen.getByText('No hay citas para este día')).toBeInTheDocument());
  });

  it('muestra un error real (no una lista vacía) si la consulta de pendientes falla', async () => {
    vi.mocked(appointmentsApi.getToday).mockResolvedValue([]);
    vi.mocked(appointmentsApi.getPending).mockRejectedValueOnce(new Error('Network Error'));

    renderPage();

    await waitFor(() => expect(screen.getByText('No hay citas para este día')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /🕓 Pendientes/i }));

    await waitFor(() => expect(screen.getByText(/no se pudieron cargar/i)).toBeInTheDocument());
  });

  it('aceptar una cita pendiente llama a confirm con su id', async () => {
    const pendingToday: Appointment = { ...todayAppt, id: 3, status: 'pending' };
    vi.mocked(appointmentsApi.getToday).mockResolvedValue([pendingToday]);
    vi.mocked(appointmentsApi.getPending).mockResolvedValue([]);
    vi.mocked(appointmentsApi.confirm).mockResolvedValueOnce({ ...pendingToday, status: 'confirmed' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage();

    await waitFor(() => expect(screen.getByText('Ana López')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

    await waitFor(() => expect(appointmentsApi.confirm).toHaveBeenCalledWith(3));
  });
});
