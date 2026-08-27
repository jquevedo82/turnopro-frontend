import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Appointment } from '@/types';

vi.mock('@/api/appointments.api', () => ({
  appointmentsApi: {
    getTomorrowForProfessional:  vi.fn(),
    markReminderForProfessional: vi.fn(),
    sendReminderForProfessional: vi.fn(),
  },
}));

const mockActiveProfessionalId = vi.fn();
vi.mock('@/store/auth.store', () => ({
  useAuthStore:          (selector: any) => selector({ activeProfessionalId: mockActiveProfessionalId() }),
  useActiveProfessional: () => ({ id: 5, name: 'Dr. García', professionalType: 'health' }),
  useCurrentUser:        () => null,
}));

const openSpy = vi.fn();
vi.stubGlobal('open', openSpy);

import { appointmentsApi } from '@/api/appointments.api';
import { SecretaryTomorrowPage } from './SecretaryTomorrowPage';

const appt: Appointment = {
  id: 1,
  professionalId: 5,
  date: '2026-08-28',
  startTime: '10:00',
  status: 'confirmed',
  reminderSent: false,
  token: 'tok123',
  client: { id: 1, name: 'Ana López', email: 'ana@test.com', phone: '+5491111111111' },
} as unknown as Appointment;

const renderPage = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <SecretaryTomorrowPage />
    </QueryClientProvider>,
  );
};

describe('SecretaryTomorrowPage', () => {
  it('pide seleccionar un profesional si no hay uno activo', () => {
    mockActiveProfessionalId.mockReturnValue(null);

    renderPage();

    expect(screen.getByText(/Seleccioná un profesional/i)).toBeInTheDocument();
    expect(appointmentsApi.getTomorrowForProfessional).not.toHaveBeenCalled();
  });

  it('lista las citas de mañana del profesional activo', async () => {
    mockActiveProfessionalId.mockReturnValue(5);
    vi.mocked(appointmentsApi.getTomorrowForProfessional).mockResolvedValueOnce([appt]);

    renderPage();

    await waitFor(() => expect(screen.getByText('Ana López')).toBeInTheDocument());
    expect(appointmentsApi.getTomorrowForProfessional).toHaveBeenCalledWith(5);
  });

  it('al hacer click en WhatsApp abre el link y marca el recordatorio enviado', async () => {
    mockActiveProfessionalId.mockReturnValue(5);
    vi.mocked(appointmentsApi.getTomorrowForProfessional).mockResolvedValue([appt]);
    vi.mocked(appointmentsApi.markReminderForProfessional).mockResolvedValueOnce({ ...appt, reminderSent: true });

    renderPage();

    await waitFor(() => expect(screen.getByText('Ana López')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /whatsapp/i }));

    expect(openSpy).toHaveBeenCalled();
    await waitFor(() => expect(appointmentsApi.markReminderForProfessional).toHaveBeenCalledWith(1, 5));
  });
});
