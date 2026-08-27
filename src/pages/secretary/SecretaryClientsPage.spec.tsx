import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PaginatedClients } from '@/types';

vi.mock('@/api/clients.api', () => ({
  clientsApi: { getForProfessional: vi.fn() },
}));

const mockActiveProfessionalId = vi.fn();
vi.mock('@/store/auth.store', () => ({
  useAuthStore:          (selector: any) => selector({ activeProfessionalId: mockActiveProfessionalId() }),
  useActiveProfessional: () => ({ id: 5, name: 'Dr. García', professionalType: 'health' }),
  useCurrentUser:        () => null,
}));

import { clientsApi } from '@/api/clients.api';
import { SecretaryClientsPage } from './SecretaryClientsPage';

const page1: PaginatedClients = {
  items: [{ id: 1, professionalId: 5, name: 'Ana López', email: 'ana@test.com', phone: '+5491111111111', createdAt: '2026-01-01' }],
  total: 2,
};
const page2: PaginatedClients = {
  items: [{ id: 2, professionalId: 5, name: 'Bruno Díaz', email: 'bruno@test.com', phone: '+5491122222222', createdAt: '2026-01-02' }],
  total: 2,
};

const renderPage = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <SecretaryClientsPage />
    </QueryClientProvider>,
  );
};

describe('SecretaryClientsPage — paginación', () => {
  it('pide "Seleccioná un profesional primero" si no hay profesional activo', () => {
    mockActiveProfessionalId.mockReturnValue(null);

    renderPage();

    expect(screen.getByText(/Seleccioná un profesional primero/i)).toBeInTheDocument();
    expect(clientsApi.getForProfessional).not.toHaveBeenCalled();
  });

  it('carga y agrega la página siguiente al hacer click en "Cargar más"', async () => {
    mockActiveProfessionalId.mockReturnValue(5);
    vi.mocked(clientsApi.getForProfessional)
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    renderPage();

    await waitFor(() => expect(screen.getByText('Ana López')).toBeInTheDocument());
    expect(clientsApi.getForProfessional).toHaveBeenCalledWith(5, 1);

    fireEvent.click(screen.getByRole('button', { name: /cargar más/i }));

    await waitFor(() => expect(screen.getByText('Bruno Díaz')).toBeInTheDocument());
    expect(clientsApi.getForProfessional).toHaveBeenCalledWith(5, 2);
  });
});
