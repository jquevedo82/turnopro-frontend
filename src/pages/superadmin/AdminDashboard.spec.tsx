import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Professional } from '@/types';

vi.mock('@/api/professionals.api', () => ({
  professionalsApi: { getAll: vi.fn() },
}));
vi.mock('@/api/appointments.api', () => ({
  appointmentsApi: { getAdminStats: vi.fn() },
}));

import { professionalsApi } from '@/api/professionals.api';
import { appointmentsApi } from '@/api/appointments.api';
import { AdminDashboard } from './AdminDashboard';

const makeProf = (over: Partial<Professional>): Professional => ({
  id: 1, name: 'Dra. García', email: 'a@a.com', phone: '', whatsappPhone: '', profession: 'Médica', slug: 'dra-garcia',
  slogan: '', bio: '', address: '', publicEmail: '', avatar: null, logo: null, instagram: '', facebook: '', gallery: [],
  plan: null, planId: null, subscriptionStart: null, subscriptionEnd: null,
  isActive: true, autoConfirm: true, slotDurationMinutes: 20, bufferMinutes: 5,
  minAdvanceHours: 2, maxAdvanceDays: 30, cancellationHours: 24, pendingExpiryHours: 2, arrivalToleranceMinutes: 15,
  createdAt: '2026-01-01',
  ...over,
});

const renderPage = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter><AdminDashboard /></MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('AdminDashboard', () => {
  it('muestra la distribución por plan y el total de citas atendidas', async () => {
    vi.mocked(professionalsApi.getAll).mockResolvedValueOnce([
      makeProf({ id: 1, plan: { id: 1, name: 'Pro', price: 1000, durationDays: 30, isActive: true } }),
      makeProf({ id: 2, plan: { id: 1, name: 'Pro', price: 1000, durationDays: 30, isActive: true } }),
      makeProf({ id: 3, plan: { id: 2, name: 'Básico', price: 500, durationDays: 30, isActive: true } }),
      makeProf({ id: 4, plan: null }),
    ]);
    vi.mocked(appointmentsApi.getAdminStats).mockResolvedValueOnce({ totalCompleted: 137 });

    renderPage();

    await waitFor(() => expect(screen.getByText('137')).toBeInTheDocument());
    expect(screen.getByText('Citas atendidas')).toBeInTheDocument();
    expect(screen.getByText('Sin plan')).toBeInTheDocument();
    expect(screen.getByText('Pro').closest('div')).toHaveTextContent('2');
    expect(screen.getByText('Básico').closest('div')).toHaveTextContent('1');
  });

  it('no muestra la sección de planes si no hay profesionales', async () => {
    vi.mocked(professionalsApi.getAll).mockResolvedValueOnce([]);
    vi.mocked(appointmentsApi.getAdminStats).mockResolvedValueOnce({ totalCompleted: 0 });

    renderPage();

    await waitFor(() => expect(screen.getByText('+ Nuevo profesional')).toBeInTheDocument());
    expect(screen.queryByText('Distribución por plan')).not.toBeInTheDocument();
  });
});
