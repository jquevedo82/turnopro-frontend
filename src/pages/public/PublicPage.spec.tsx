import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { Professional } from '@/types';

const baseProfessional: Professional = {
  id: 1, name: 'Dr. García', email: 'garcia@test.com', phone: '+5491112345678',
  whatsappPhone: '+5491112345678', profession: 'Médico', slug: 'dr-garcia',
  slogan: '', bio: '', address: '', publicEmail: 'garcia@test.com', avatar: null,
  logo: null, instagram: '', facebook: '', gallery: [],
  plan: null, planId: null, subscriptionStart: null, subscriptionEnd: null,
  isActive: true, autoConfirm: false, slotDurationMinutes: 30, bufferMinutes: 0,
  minAdvanceHours: 0, maxAdvanceDays: 60, cancellationHours: 0, pendingExpiryHours: 2,
  arrivalToleranceMinutes: 15, createdAt: '2026-01-01',
};

const mockUsePublicProfile = vi.fn();

vi.mock('@/hooks/usePublic', () => ({
  usePublicProfile:  () => mockUsePublicProfile(),
  usePublicServices: () => ({ data: [] }),
}));

vi.mock('@/hooks/useAvailability', () => ({
  useAvailableDays: () => ({ data: [] }),
  useSlots:         () => ({ data: [], isFetching: false }),
}));

vi.mock('@/hooks/useAppointments', () => ({
  useCreateAppointment: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

import { PublicPage } from './PublicPage';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/dr-garcia']}>
      <Routes>
        <Route path="/:slug" element={<PublicPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('PublicPage — imagen del profesional', () => {
  it('sirve el avatar con transformación Cloudinary (f_auto,q_auto) cuando hay foto cargada', () => {
    mockUsePublicProfile.mockReturnValue({
      data: { ...baseProfessional, avatar: 'https://res.cloudinary.com/demo/image/upload/v1/turnopro/avatars/dr-garcia.jpg' },
      isLoading: false, error: null,
    });

    renderPage();

    const img = screen.getByAltText('Dr. García') as HTMLImageElement;
    expect(img.src).toContain('/upload/f_auto,q_auto,w_300/');
  });

  it('muestra la inicial del nombre en vez de una imagen cuando no hay avatar cargado', () => {
    mockUsePublicProfile.mockReturnValue({
      data: { ...baseProfessional, avatar: null },
      isLoading: false, error: null,
    });

    renderPage();

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });
});
