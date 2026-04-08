/** Utilidades de validación compartidas entre páginas del frontend */

export const isValidEmail = (v: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const isValidPhone = (v: string): boolean =>
  /^\+?[0-9]{8,15}$/.test(v.replace(/\s/g, ""));
