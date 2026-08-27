import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PhoneInput, COUNTRIES, validateLocalPhone } from './PhoneInput';

describe('PhoneInput — países soportados', () => {
  it('incluye Argentina, Colombia y Venezuela', () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(codes).toEqual(['+54', '+57', '+58']);
  });
});

describe('PhoneInput — defaultCountryCode', () => {
  it('usa defaultCountryCode como preseleccionado cuando value está vacío', () => {
    render(<PhoneInput value="" onChange={vi.fn()} defaultCountryCode="+57" />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('+57');
  });

  it('arranca en Argentina si no se pasa defaultCountryCode', () => {
    render(<PhoneInput value="" onChange={vi.fn()} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('+54');
  });

  it('ignora un defaultCountryCode no soportado y cae a Argentina', () => {
    render(<PhoneInput value="" onChange={vi.fn()} defaultCountryCode="+1" />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('+54');
  });

  it('si value ya tiene un número, ignora defaultCountryCode y usa el código del valor', () => {
    render(<PhoneInput value="+584121234567" onChange={vi.fn()} defaultCountryCode="+57" />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('+58');
  });
});

describe('validateLocalPhone — Colombia', () => {
  it('acepta 10 dígitos', () => {
    expect(validateLocalPhone('3001234567', '+57')).toBeNull();
  });

  it('rechaza menos de 10 dígitos', () => {
    expect(validateLocalPhone('300123456', '+57')).toContain('Colombia');
  });
});
