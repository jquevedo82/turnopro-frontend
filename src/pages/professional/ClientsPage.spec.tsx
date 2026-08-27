import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PaginatedClients } from '@/types';

vi.mock('@/api/clients.api', () => ({
  clientsApi: { getMy: vi.fn() },
}));

import { clientsApi } from '@/api/clients.api';
import { ClientsPage } from './ClientsPage';

const page1: PaginatedClients = {
  items: [
    { id: 1, professionalId: 1, name: 'Ana López', email: 'ana@test.com', phone: '+5491111111111', createdAt: '2026-01-01' },
  ],
  total: 2,
};
const page2: PaginatedClients = {
  items: [
    { id: 2, professionalId: 1, name: 'Bruno Díaz', email: 'bruno@test.com', phone: '+5491122222222', createdAt: '2026-01-02' },
  ],
  total: 2,
};

const renderPage = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ClientsPage />
    </QueryClientProvider>,
  );
};

describe('ClientsPage — paginación', () => {
  it('muestra el total (no la cantidad cargada) y el primer lote de clientes', async () => {
    vi.mocked(clientsApi.getMy).mockResolvedValue(page1);

    renderPage();

    await waitFor(() => expect(screen.getByText('Ana López')).toBeInTheDocument());
    expect(screen.getByText('2 registrados')).toBeInTheDocument();
    expect(clientsApi.getMy).toHaveBeenCalledWith(1);
  });

  it('muestra "Cargar más" cuando quedan clientes sin traer, y los agrega a la lista al hacer click', async () => {
    vi.mocked(clientsApi.getMy)
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    renderPage();

    await waitFor(() => expect(screen.getByText('Ana López')).toBeInTheDocument());
    const loadMoreBtn = screen.getByRole('button', { name: /cargar más/i });
    fireEvent.click(loadMoreBtn);

    await waitFor(() => expect(screen.getByText('Bruno Díaz')).toBeInTheDocument());
    expect(clientsApi.getMy).toHaveBeenCalledWith(2);
    expect(screen.getByText('Ana López')).toBeInTheDocument(); // el primer lote sigue visible
  });

  it('no muestra "Cargar más" si ya se cargaron todos los clientes', async () => {
    vi.mocked(clientsApi.getMy).mockResolvedValue({ items: page1.items, total: 1 });

    renderPage();

    await waitFor(() => expect(screen.getByText('Ana López')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /cargar más/i })).not.toBeInTheDocument();
  });
});
