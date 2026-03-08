import type { Service } from "@/types";

interface Props { services: Service[]; selected: Service | null; onSelect: (s: Service) => void }

export const ServiceSelector = ({ services, selected, onSelect }: Props) => {
  if (services.length === 0) return (
    <div className="text-center py-8 text-gray-400">
      <p className="text-sm">Este profesional aún no tiene servicios disponibles</p>
    </div>
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {services.map((s) => (
        <button key={s.id} onClick={() => onSelect(s)}
          className={`text-left p-4 rounded-xl border-2 transition-all active:scale-98 ${
            selected?.id === s.id
              ? "border-blue-500 bg-blue-50 shadow-sm"
              : "border-gray-200 bg-white hover:border-blue-300"
          }`}>
          <div className="font-semibold text-gray-900 text-sm">{s.name}</div>
          <div className="text-xs text-gray-400 mt-1">⏱ {s.durationMinutes} min</div>
          {s.description && <div className="text-xs text-gray-500 mt-1.5 line-clamp-2">{s.description}</div>}
        </button>
      ))}
    </div>
  );
};
