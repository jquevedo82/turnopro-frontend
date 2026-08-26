import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookingForm } from './BookingForm';
import type { Service } from '@/types';

const service: Service = {
  id: 1, professionalId: 1, name: 'Consulta', description: '', durationMinutes: 30, bufferMinutes: null, isActive: true,
};

const renderForm = (defaultCountryCode?: string) =>
  render(
    <BookingForm
      service={service} date="2026-08-01" slot="10:00"
      onSubmit={vi.fn()} loading={false}
      defaultCountryCode={defaultCountryCode}
    />,
  );

describe('BookingForm — país del teléfono por defecto', () => {
  it('usa defaultCountryCode del profesional para preseleccionar el país del paciente', () => {
    renderForm('+57');
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('+57');
  });

  it('arranca en Argentina si el profesional no configuró país (defaultCountryCode undefined)', () => {
    renderForm(undefined);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('+54');
  });
});

describe('BookingForm — terminología por vertical', () => {
  it('usa "paciente" por default (vertical health)', () => {
    render(
      <BookingForm service={service} date="2026-08-01" slot="10:00" onSubmit={vi.fn()} loading={false} />,
    );
    expect(screen.getByText('Nombre del paciente *')).toBeInTheDocument();
  });

  it('usa "cliente" para un profesional del vertical beauty', () => {
    render(
      <BookingForm
        service={service} date="2026-08-01" slot="10:00"
        onSubmit={vi.fn()} loading={false} professionalType="beauty"
      />,
    );
    expect(screen.getByText('Nombre del cliente *')).toBeInTheDocument();
    expect(screen.queryByText('Nombre del paciente *')).not.toBeInTheDocument();
  });
});
