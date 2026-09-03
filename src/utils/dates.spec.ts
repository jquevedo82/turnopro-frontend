import { describe, it, expect, vi, afterEach } from 'vitest';
import { toYMD, today } from './dates';

describe('toYMD / today() — fecha-calendario LOCAL, no UTC', () => {
  afterEach(() => { vi.useRealTimers(); });

  it('today() usa la fecha local, no la de toISOString() (UTC)', () => {
    // 23:30 hora LOCAL del 15 de enero — con toISOString() (UTC) esto ya muestra
    // el 16 en cualquier huso horario detrás de UTC (Argentina, Venezuela, etc.),
    // que es exactamente el bug: "Agenda de hoy" mostraba el día siguiente después
    // de cierta hora de la tarde/noche, y una cita de HOY no aparecía en ningún lado.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15, 23, 30)); // constructor LOCAL

    expect(today()).toBe('2026-01-15');
  });

  it('toYMD() arma la fecha con los componentes locales del Date recibido', () => {
    const d = new Date(2026, 8, 5); // 5 de setiembre 2026, local
    expect(toYMD(d)).toBe('2026-09-05');
  });
});
