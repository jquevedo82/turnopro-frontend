import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookingCalendar } from './BookingCalendar';

const baseProps = {
  year: 2026, month: 9,
  availableDays: ['2026-09-15'],
  selected: '',
  onSelect: vi.fn(),
  onPrev: vi.fn(),
  onNext: vi.fn(),
};

describe('BookingCalendar — indicador de carga', () => {
  it('muestra el spinner y no la grilla de días mientras loading=true', () => {
    render(<BookingCalendar {...baseProps} loading />);

    expect(screen.getByText(/Buscando días disponibles/i)).toBeInTheDocument();
    expect(screen.queryByText('15')).not.toBeInTheDocument();
  });

  it('muestra la grilla normal cuando loading=false (o no se pasa)', () => {
    render(<BookingCalendar {...baseProps} />);

    expect(screen.queryByText(/Buscando días disponibles/i)).not.toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });
});
