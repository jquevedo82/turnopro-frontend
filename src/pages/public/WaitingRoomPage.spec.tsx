/**
 * WaitingRoomPage.spec.tsx
 * Tests unitarios de la pantalla pública de sala de espera.
 * Verifica: renderizado de la cola, estado vacío, manejo de errores.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { PublicQueueEntry } from '@/types';

// ── Mock del API ──────────────────────────────────────────────────────────────
vi.mock('@/api/appointments.api', () => ({
  appointmentsApi: {
    getPublicQueue:  vi.fn(),
    getQueueVersion: vi.fn(),
  },
}));

import { appointmentsApi } from '@/api/appointments.api';
import { WaitingRoomPage } from './WaitingRoomPage';

const renderPage = (slug = 'dr-garcia') =>
  render(
    <MemoryRouter initialEntries={[`/sala/${slug}`]}>
      <Routes>
        <Route path="/sala/:slug" element={<WaitingRoomPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('WaitingRoomPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Por defecto, queue-version sin cambios
    vi.mocked(appointmentsApi.getQueueVersion).mockResolvedValue({ queueUpdatedAt: null });
  });

  it('muestra estado vacío cuando no hay pacientes', async () => {
    vi.mocked(appointmentsApi.getPublicQueue).mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/No hay pacientes en espera/i)).toBeInTheDocument();
    });
  });

  it('muestra los pacientes de la cola con nombre y estado', async () => {
    const queue: PublicQueueEntry[] = [
      { position: 1, name: 'Juan G.', status: 'arrived' },
      { position: 2, name: 'Ana L.', status: 'in_progress' },
    ];
    vi.mocked(appointmentsApi.getPublicQueue).mockResolvedValue(queue);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Juan G.')).toBeInTheDocument();
      expect(screen.getByText('Ana L.')).toBeInTheDocument();
    });
    expect(screen.getByText('Esperando')).toBeInTheDocument();
    expect(screen.getByText('En consulta')).toBeInTheDocument();
  });

  it('muestra símbolo ▶ para el paciente en consulta', async () => {
    const queue: PublicQueueEntry[] = [
      { position: 1, name: 'Carlos P.', status: 'in_progress' },
    ];
    vi.mocked(appointmentsApi.getPublicQueue).mockResolvedValue(queue);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('▶')).toBeInTheDocument();
    });
  });

  it('muestra posición #N para pacientes esperando', async () => {
    const queue: PublicQueueEntry[] = [
      { position: 1, name: 'María R.', status: 'arrived' },
      { position: 2, name: 'Luis T.', status: 'arrived' },
    ];
    vi.mocked(appointmentsApi.getPublicQueue).mockResolvedValue(queue);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
    });
  });

  it('muestra error si la API falla', async () => {
    vi.mocked(appointmentsApi.getPublicQueue).mockRejectedValue(new Error('network error'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Sin conexión/i)).toBeInTheDocument();
    });
  });

  it('llama a getPublicQueue con el slug correcto', async () => {
    vi.mocked(appointmentsApi.getPublicQueue).mockResolvedValue([]);

    renderPage('dr-smith');

    await waitFor(() => {
      expect(vi.mocked(appointmentsApi.getPublicQueue)).toHaveBeenCalledWith('dr-smith');
    });
  });
});
