/** Utilidades de validación compartidas entre páginas del frontend */

export const isValidEmail = (v: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const isValidPhone = (v: string): boolean =>
  /^\+?[0-9]{8,15}$/.test(v.replace(/\s/g, ""));

/** Nombre + apellido (mínimo 2 palabras). Admite tildes, ñ, guion y apóstrofe
 * en cualquier posición — cubre "García-López", "De La Cruz", "O'Brien". */
export const NAME_PATTERN = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ'-]+(\s+[a-záéíóúüñA-ZÁÉÍÓÚÜÑ'-]+)+$/;

export const isValidFullName = (v: string): boolean => NAME_PATTERN.test(v);
