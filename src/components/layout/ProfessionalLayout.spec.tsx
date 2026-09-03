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

describe('ProfessionalLayout — pestaña Pendientes condicional', () => {
  it('no muestra "Pendientes" si el profesional auto-confirma', () => {
    mockUser.mockReturnValue({ name: 'Dra. García', autoConfirm: true });

    renderLayout();

    expect(screen.queryAllByText('Pendientes')).toHaveLength(0);
  });

  it('muestra "Pendientes" si el profesional NO auto-confirma', () => {
    mockUser.mockReturnValue({ name: 'Dr. Pérez', autoConfirm: false });

    renderLayout();

    expect(screen.getAllByText('Pendientes').length).toBeGreaterThan(0);
  });
});
