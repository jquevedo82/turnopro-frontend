import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPhone, isValidFullName } from './validation';

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

describe('isValidFullName', () => {
  it('acepta nombre y apellido simples', () => {
    expect(isValidFullName('Juan García')).toBe(true);
  });

  it('acepta apellido compuesto con guion en cualquier posición', () => {
    expect(isValidFullName('Ana-María Pérez')).toBe(true);
    expect(isValidFullName('García-López Juan')).toBe(true);
  });

  it('acepta apóstrofe en el apellido', () => {
    expect(isValidFullName("Conor O'Brien")).toBe(true);
  });

  it('acepta nombre compuesto de más de dos palabras', () => {
    expect(isValidFullName('De La Cruz')).toBe(true);
    expect(isValidFullName('María José García')).toBe(true);
  });

  it('rechaza una sola palabra', () => {
    expect(isValidFullName('Juan')).toBe(false);
  });

  it('rechaza números o símbolos sueltos al final', () => {
    expect(isValidFullName('Juan García123')).toBe(false);
  });

  it('rechaza string vacío', () => {
    expect(isValidFullName('')).toBe(false);
  });
});
