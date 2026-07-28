export interface Plan { id: number; name: string; price: number; durationDays: number; isActive: boolean }
export interface Professional {
  id: number; name: string; email: string; phone: string; whatsappPhone: string; profession: string; slug: string
  slogan: string; bio: string; address: string; publicEmail: string; avatar: string | null
  logo: string | null; instagram: string; facebook: string; gallery: string[]
  plan: Plan | null; planId: number | null; subscriptionStart: string | null; subscriptionEnd: string | null
  isActive: boolean; autoConfirm: boolean; slotDurationMinutes: number; bufferMinutes: number
  minAdvanceHours: number; maxAdvanceDays: number; cancellationHours: number; pendingExpiryHours: number; arrivalToleranceMinutes: number; createdAt: string
  professionalType?: 'health' | 'beauty' | 'wellness' | 'other'
  country?: string | null // '+54' | '+57' | '+58' — default del selector de país en el teléfono del cliente
}
export interface Service { id: number; professionalId: number; name: string; description: string; durationMinutes: number; bufferMinutes: number | null; isActive: boolean }
export interface ProfessionalSchedule { id: number; professionalId: number; dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }
export interface ScheduleException { id: number; professionalId: number; date: string; isClosed: boolean; customStartTime: string | null; customEndTime: string | null; reason: string }
export interface Client { id: number; professionalId: number; name: string; email: string; phone: string; createdAt: string }
export interface PaginatedClients { items: Client[]; total: number }
export type AppointmentStatus =
  | "pending" | "confirmed" | "reconfirmed"
  | "arrived" | "in_progress"
  | "cancelled" | "rejected" | "expired" | "completed" | "no_show"

export interface Appointment {
  id: number; professionalId: number; clientId: number; serviceId: number
  date: string; startTime: string; endTime: string; status: AppointmentStatus
  cancelledBy: "client"|"professional"|null; token: string; tokenUsedAt: string | null
  reminderSent: boolean; reconfirmedAt: string | null; reconfirmedBy: "client"|"professional"|null
  arrivedAt: string | null
  notes: string | null; createdAt: string; client: Client; service: Service; professional: Professional
}

/** Entrada de la cola pública — devuelta por GET /public/:slug/queue */
export interface PublicQueueEntry {
  position: number;
  name:     string;   // Nombre anonimizado: "Juan G."
  status:   "arrived" | "in_progress";
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/** Profesional reducido que devuelve el login de secretaria para popular el selector */
export interface SecretaryProfessional {
  id:               number;
  name:             string;
  profession:       string;
  slug:             string;
  avatar:           string | null;
  professionalType?: 'health' | 'beauty' | 'wellness' | 'other';
}

export interface AuthUser {
  id:               number;
  email:            string;
  role:             "superadmin" | "professional" | "secretary";
  name?:            string;
  // Solo para profesionales
  slug?:            string;
  professionalType?: 'health' | 'beauty' | 'wellness' | 'other';
  // Solo para secretarias
  organizationId?:  number;
  professionals?:   SecretaryProfessional[]; // lista para el selector "Trabajando como..."
}

export interface LoginResponse {
  accessToken: string;
  user:        AuthUser;
}
