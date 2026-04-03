import { describe, it, expect } from 'vitest';
import { getVerticalConfig, PROFESSIONAL_TYPE_OPTIONS } from './verticals';

describe('getVerticalConfig — frontend', () => {
  it('health → Paciente / Cita', () => {
    const vc = getVerticalConfig('health');
    expect(vc.clientLabel).toBe('Paciente');
    expect(vc.clientLabelPlural).toBe('Pacientes');
    expect(vc.appointmentLabel).toBe('Cita');
    expect(vc.appointmentLabelPlural).toBe('Citas');
  });

  it('beauty → Cliente / Turno', () => {
    const vc = getVerticalConfig('beauty');
    expect(vc.clientLabel).toBe('Cliente');
    expect(vc.appointmentLabel).toBe('Turno');
  });

  it('wellness → Cliente / Sesión', () => {
    const vc = getVerticalConfig('wellness');
    expect(vc.appointmentLabel).toBe('Sesión');
    expect(vc.appointmentLabelPlural).toBe('Sesiones');
  });

  it('other → Cliente / Turno', () => {
    const vc = getVerticalConfig('other');
    expect(vc.clientLabel).toBe('Cliente');
  });

  it('undefined → fallback a health', () => {
    expect(getVerticalConfig(undefined).clientLabel).toBe('Paciente');
    expect(getVerticalConfig(null).clientLabel).toBe('Paciente');
  });

  it('tipo desconocido → fallback a health', () => {
    expect(getVerticalConfig('desconocido').clientLabel).toBe('Paciente');
  });

  it('PROFESSIONAL_TYPE_OPTIONS tiene las 4 opciones', () => {
    expect(PROFESSIONAL_TYPE_OPTIONS).toHaveLength(4);
    const values = PROFESSIONAL_TYPE_OPTIONS.map(o => o.value);
    expect(values).toContain('health');
    expect(values).toContain('beauty');
    expect(values).toContain('wellness');
    expect(values).toContain('other');
  });

  it('cada opción tiene value, label y examples', () => {
    PROFESSIONAL_TYPE_OPTIONS.forEach(opt => {
      expect(opt.value).toBeTruthy();
      expect(opt.label).toBeTruthy();
      expect(opt.examples).toBeTruthy();
    });
  });
});
