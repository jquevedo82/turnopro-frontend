import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookingSuccess } from './BookingSuccess';
import type { Appointment, Professional } from '@/types';

const professional = { id: 1, name: 'Dra. García', profession: 'Médica' } as Professional;

const appointment = {
  id: 1, date: '2026-08-26', startTime: '10:00', status: 'confirmed',
  service: { name: 'Consulta' },
} as unknown as Appointment;

describe('BookingSuccess — terminología por vertical', () => {
  it('usa "cita" por default (vertical health)', () => {
    render(<BookingSuccess appointment={appointment} professional={professional} onNew={vi.fn()} />);
    expect(screen.getByText('¡Solicitud de cita enviada!')).toBeInTheDocument();
  });

  it('usa "turno" para un profesional del vertical beauty', () => {
    const beautyProf = { ...professional, professionalType: 'beauty' } as Professional;
    render(<BookingSuccess appointment={appointment} professional={beautyProf} onNew={vi.fn()} />);
    expect(screen.getByText('¡Solicitud de turno enviada!')).toBeInTheDocument();
  });

  it('usa "sesión" para un profesional del vertical wellness', () => {
    const wellnessProf = { ...professional, professionalType: 'wellness' } as Professional;
    render(<BookingSuccess appointment={appointment} professional={wellnessProf} onNew={vi.fn()} />);
    expect(screen.getByText('¡Solicitud de sesión enviada!')).toBeInTheDocument();
  });
});
