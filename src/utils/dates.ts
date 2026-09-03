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

// OJO: NO usar date.toISOString() acá — convierte a UTC, y en Venezuela (UTC-4)
// cualquier hora desde las 20:00 en adelante ya cae en el día siguiente en UTC.
// today() (usada como fecha por defecto en Dashboard, Cola, Nueva cita, etc. en
// 8 lugares) devolvía "mañana" en vez de "hoy" durante esas horas — el profesional
// veía "Agenda de hoy" pero en realidad consultaba el día siguiente, y una cita
// pendiente de HOY no aparecía en ningún lado. Se arma con los getters locales.
export const toYMD = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const today = (): string => toYMD(new Date());

/** Devuelve la hora local actual en formato HH:mm — para pasar al backend como ?localNow */
export const localNow = (): string => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

export const DAYS_ES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
export const DAYS_SHORT = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];