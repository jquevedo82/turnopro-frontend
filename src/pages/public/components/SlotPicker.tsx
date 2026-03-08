import { Spinner } from "@/components/ui/Spinner";

interface Props { slots: string[]; selected: string; loading: boolean; onSelect: (s: string) => void }

export const SlotPicker = ({ slots, selected, loading, onSelect }: Props) => {
  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;
  if (slots.length === 0) return (
    <div className="text-center py-8 text-gray-400">
      <div className="text-3xl mb-2">📭</div>
      <p className="text-sm">No hay horarios disponibles para este día</p>
    </div>
  );
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => (
        <button key={slot} onClick={() => onSelect(slot)}
          className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all min-h-[52px] ${
            selected === slot
              ? "border-blue-600 bg-blue-600 text-white shadow-sm"
              : "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600 active:bg-blue-50"
          }`}>
          {slot}
        </button>
      ))}
    </div>
  );
};
