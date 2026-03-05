/**
 * utils/dates.ts — Funciones puras de formateo de fechas.
 * Para cambiar el idioma: modificar el locale "es-ES"
 */
export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
};

export const formatDateShort = (dateStr: string): string => {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-ES", { day:"numeric", month:"short" });
};

export const toYMD = (date: Date): string => date.toISOString().split("T")[0];

export const today = (): string => toYMD(new Date());

export const DAYS_ES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
export const DAYS_SHORT = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];
