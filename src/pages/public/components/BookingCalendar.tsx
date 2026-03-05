import { DAYS_SHORT } from "@/utils/dates";

const MONTHS_ES = ["","Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

interface Props {
  year: number; month: number; availableDays: string[]; selected: string;
  onSelect: (d: string) => void; onPrev: () => void; onNext: () => void;
}

export const BookingCalendar = ({ year, month, availableDays, selected, onSelect, onPrev, onNext }: Props) => {
  const today   = new Date().toISOString().split("T")[0];
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const pad = (d: number) => `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <button onClick={onPrev} className="text-gray-400 hover:text-gray-700 px-2 py-1 rounded transition-colors">‹</button>
        <span className="font-display font-semibold text-gray-800">{MONTHS_ES[month]} {year}</span>
        <button onClick={onNext} className="text-gray-400 hover:text-gray-700 px-2 py-1 rounded transition-colors">›</button>
      </div>
      <div className="grid grid-cols-7 px-3 py-2">
        {DAYS_SHORT.map((d) => (
          <div key={d} className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">{d}</div>
        ))}
        {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateStr = pad(day);
          const avail   = availableDays.includes(dateStr);
          const isSel   = selected === dateStr;
          const isPast  = dateStr < today;
          return (
            <button key={day} disabled={!avail || isPast} onClick={() => onSelect(dateStr)}
              className={`text-center py-2 mx-0.5 my-0.5 rounded-lg text-sm transition-all ${
                isSel   ? "bg-blue-600 text-white font-bold" :
                avail && !isPast ? "text-gray-900 font-medium hover:bg-blue-50 hover:text-blue-600" :
                "text-gray-300 cursor-default"
              }`}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
