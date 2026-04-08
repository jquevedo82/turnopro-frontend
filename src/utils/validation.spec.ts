import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPhone } from './validation';

describe('isValidEmail', () => {
  it('acepta email válido', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('dr.garcia@clinica.org')).toBe(true);
  });

  it('rechaza email sin @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rechaza email sin dominio', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('rechaza string vacío', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('acepta número con código de país', () => {
    expect(isValidPhone('+5491112345678')).toBe(true);
    expect(isValidPhone('+584121234567')).toBe(true);
  });

  it('acepta número sin + con suficientes dígitos', () => {
    expect(isValidPhone('5491112345678')).toBe(true);
  });

  it('acepta número con espacios (los ignora)', () => {
    expect(isValidPhone('+54 911 1234 5678')).toBe(true);
  });

  it('rechaza número muy corto', () => {
    expect(isValidPhone('+123')).toBe(false);
  });

  it('rechaza string con letras', () => {
    expect(isValidPhone('+54abc12345')).toBe(false);
  });
});
