import { Spinner } from "@/components/ui/Spinner";

interface Props { slots: string[]; selected: string; loading: boolean; onSelect: (s: string) => void }

export const SlotPicker = ({ slots, selected, loading, onSelect }: Props) => {
  if (loading) return <div className="flex justify-center py-6"><Spinner /></div>;
  if (slots.length === 0) return <p className="text-gray-400 text-sm py-4">No hay horarios disponibles para este día.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((slot) => (
        <button key={slot} onClick={() => onSelect(slot)}
          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
            selected === slot ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600"
          }`}>
          {slot}
        </button>
      ))}
    </div>
  );
};
