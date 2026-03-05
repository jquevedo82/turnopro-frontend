import type { AppointmentStatus } from "@/types";

const STATUS_MAP: Record<AppointmentStatus | string, { label: string; cls: string }> = {
  confirmed:   { label: "Confirmada",      cls: "badge-blue"  },
  reconfirmed: { label: "Reconfirmada ✓",  cls: "badge-green" },
  cancelled:   { label: "Cancelada",       cls: "badge-red"   },
  pending:     { label: "Pendiente",       cls: "badge-amber" },
  rejected:    { label: "Rechazada",       cls: "badge-red"   },
  expired:     { label: "Expirada",        cls: "badge-gray"  },
  completed:   { label: "Completada",      cls: "badge-teal"  },
  no_show:     { label: "No asistió",      cls: "badge-red"   },
  active:      { label: "Activo",          cls: "badge-green" },
  inactive:    { label: "Inactivo",        cls: "badge-red"   },
  no_response: { label: "Sin respuesta ⚠️", cls: "badge-amber" },
};

export const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_MAP[status] ?? { label: status, cls: "badge-gray" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
};
