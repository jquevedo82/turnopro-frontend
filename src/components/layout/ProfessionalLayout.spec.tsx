import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mockUser = vi.fn();
vi.mock('@/store/auth.store', () => ({
  useAuthStore: () => ({ user: mockUser(), logout: vi.fn() }),
}));

import { ProfessionalLayout } from './ProfessionalLayout';

const renderLayout = () =>
  render(
    <MemoryRouter initialEntries={['/panel']}>
      <Routes>
        <Route path="/panel" element={<ProfessionalLayout />}>
          <Route index element={<div>contenido</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('ProfessionalLayout — menú', () => {
  it('muestra "Agenda" como primera entrada, sin "Mañana" ni "Pendientes" por separado', () => {
    // Hoy + Mañana + Pendientes se unificaron en una sola pantalla (AgendaPage)
    // con navegador de fecha + filtro de estado + toggle de pendientes.
    mockUser.mockReturnValue({ name: 'Dra. García', autoConfirm: false });

    renderLayout();

    expect(screen.getAllByText('Agenda').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Mañana')).toHaveLength(0);
    expect(screen.queryAllByText('Pendientes')).toHaveLength(0);
  });
});
