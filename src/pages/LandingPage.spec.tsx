import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseCurrentUser = vi.fn();
vi.mock('@/store/auth.store', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

import { LandingPage } from './LandingPage';

const renderPage = () => render(<MemoryRouter><LandingPage /></MemoryRouter>);

describe('LandingPage — sin sesión', () => {
  beforeEach(() => {
    mockUseCurrentUser.mockReturnValue(null);
  });

  it('muestra el hero y el link de login, no redirige', () => {
    renderPage();
    expect(screen.getByText('Tu agenda, resuelta en un link')).toBeInTheDocument();
    expect(screen.getAllByText('Iniciar sesión').length).toBeGreaterThan(0);
  });

  it('no muestra precios ni planes', () => {
    renderPage();
    expect(screen.queryByText(/plan/i)).not.toBeInTheDocument();
  });

  it('el CTA principal cae a un link de login cuando no hay VITE_SUPPORT_WHATSAPP configurado', () => {
    renderPage();
    expect(screen.getAllByText('Quiero saber más').length).toBeGreaterThan(0);
  });
});

describe('LandingPage — con sesión activa', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // @ts-expect-error — reemplazo window.location para espiar replace() sin navegar de verdad
    delete window.location;
    window.location = { ...originalLocation, replace: vi.fn() } as any;
  });

  afterEach(() => {
    (window as any).location = originalLocation;
  });

  it('redirige a /panel si es profesional', () => {
    mockUseCurrentUser.mockReturnValue({ role: 'professional' });
    renderPage();
    expect(window.location.replace).toHaveBeenCalledWith('/panel');
  });

  it('redirige a /admin si es superadmin', () => {
    mockUseCurrentUser.mockReturnValue({ role: 'superadmin' });
    renderPage();
    expect(window.location.replace).toHaveBeenCalledWith('/admin');
  });

  it('redirige a /secretaria si es secretaria', () => {
    mockUseCurrentUser.mockReturnValue({ role: 'secretary' });
    renderPage();
    expect(window.location.replace).toHaveBeenCalledWith('/secretaria');
  });
});
