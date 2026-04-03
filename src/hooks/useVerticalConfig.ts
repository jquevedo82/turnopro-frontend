/**
 * useVerticalConfig — Hook que devuelve los labels y config del vertical
 * del profesional autenticado.
 *
 * Uso en el panel del profesional:
 *   const vc = useVerticalConfig();
 *   <h1>{vc.clientLabelPlural}</h1>  →  "Pacientes" o "Clientes" según el tipo
 *
 * Uso con tipo explícito (página pública, panel secretaria):
 *   const vc = useVerticalConfig(professional.professionalType);
 */
import { useCurrentUser } from '@/store/auth.store';
import { getVerticalConfig } from '@/config/verticals';
import type { ProfessionalType } from '@/config/verticals';

export function useVerticalConfig(explicitType?: ProfessionalType | string | null) {
  const user = useCurrentUser();
  const type = explicitType ?? (user as any)?.professionalType ?? 'health';
  return getVerticalConfig(type);
}
