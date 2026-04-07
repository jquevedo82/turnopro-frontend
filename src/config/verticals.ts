/**
 * verticals.ts — Terminología y feature flags por tipo de profesional.
 * Espejo del archivo equivalente en el backend.
 *
 * Para cambiar los labels: modificar el objeto del vertical correspondiente.
 * Para agregar un vertical: agregar el tipo al enum y su config aquí.
 */

export type ProfessionalType = 'health' | 'beauty' | 'wellness' | 'other';

export interface VerticalConfig {
  clientLabel:            string;   // "Paciente" | "Cliente"
  clientLabelPlural:      string;   // "Pacientes" | "Clientes"
  appointmentLabel:       string;   // "Cita" | "Turno" | "Sesión"
  appointmentLabelPlural: string;   // "Citas" | "Turnos" | "Sesiones"
  emailGreeting:          string;
}

const VERTICAL_CONFIG: Record<ProfessionalType, VerticalConfig> = {
  health: {
    clientLabel:            'Paciente',
    clientLabelPlural:      'Pacientes',
    appointmentLabel:       'Cita',
    appointmentLabelPlural: 'Citas',
    emailGreeting:          'Estimado/a',
  },
  beauty: {
    clientLabel:            'Cliente',
    clientLabelPlural:      'Clientes',
    appointmentLabel:       'Turno',
    appointmentLabelPlural: 'Turnos',
    emailGreeting:          'Hola',
  },
  wellness: {
    clientLabel:            'Cliente',
    clientLabelPlural:      'Clientes',
    appointmentLabel:       'Sesión',
    appointmentLabelPlural: 'Sesiones',
    emailGreeting:          'Hola',
  },
  other: {
    clientLabel:            'Cliente',
    clientLabelPlural:      'Clientes',
    appointmentLabel:       'Turno',
    appointmentLabelPlural: 'Turnos',
    emailGreeting:          'Hola',
  },
};

export const PROFESSIONAL_TYPE_OPTIONS: { value: ProfessionalType; label: string; examples: string }[] = [
  { value: 'health',   label: 'Salud',     examples: 'Médico, Psicólogo, Dentista, Nutricionista' },
  { value: 'beauty',   label: 'Estética',  examples: 'Peluquería, Manicura, Barbería, Spa' },
  { value: 'wellness', label: 'Bienestar', examples: 'Personal trainer, Yoga, Pilates, Masajes' },
  { value: 'other',    label: 'Otro',      examples: 'Cualquier otro profesional' },
];

export function getVerticalConfig(type?: ProfessionalType | string | null): VerticalConfig {
  return VERTICAL_CONFIG[(type as ProfessionalType) ?? 'health'] ?? VERTICAL_CONFIG['health'];
}
