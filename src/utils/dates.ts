/**
 * utils/dates.ts — Funciones puras de formateo de fechas.
 * Para cambiar el idioma: modificar el locale "es-ES"
 */
// Parsea tanto "YYYY-MM-DD" como timestamps ISO completos "2026-03-08T14:23:00.000Z"
const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date("invalid");
  // Si ya es un ISO completo (tiene T y más de 10 chars), parsear directo
  if (dateStr.length > 10 && dateStr.includes("T")) return new Date(dateStr);
  // Si es solo fecha "YYYY-MM-DD", fijar mediodía para evitar desfase de zona horaria
  return new Date(dateStr + "T12:00:00");
};

export const formatDate = (dateStr: string): string => {
  const d = parseDate(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
};

export const formatDateShort = (dateStr: string): string => {
  const d = parseDate(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-ES", { day:"numeric", month:"short", year:"numeric" });
};

export const toYMD = (date: Date): string => date.toISOString().split("T")[0];

export const today = (): string => toYMD(new Date());

export const DAYS_ES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
export const DAYS_SHORT = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];