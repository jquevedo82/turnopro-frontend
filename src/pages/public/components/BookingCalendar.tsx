import { DAYS_SHORT } from "@/utils/dates";

const MONTHS_ES = ["","Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

interface Props {
  year: number; month: number; availableDays: string[]; selected: string;
  onSelect: (d: string) => void; onPrev: () => void; onNext: () => void;
}

export const BookingCalendar = ({ year, month, availableDays, selected, onSelect, onPrev, onNext }: Props) => {
  const today       = new Date().toISOString().split("T")[0];
  const firstDay    = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const pad = (d: number) => `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <button onClick={onPrev} className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 text-xl">‹</button>
        <span className="font-display font-semibold text-gray-800">{MONTHS_ES[month]} {year}</span>
        <button onClick={onNext} className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 text-xl">›</button>
      </div>
      <div className="grid grid-cols-7 px-2 pt-2 pb-3">
        {DAYS_SHORT.map((d) => (
          <div key={d} className="text-center py-1.5 text-xs font-semibold text-gray-400 uppercase">{d}</div>
        ))}
        {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateStr = pad(day);
          const avail   = availableDays.includes(dateStr);
          const isSel   = selected === dateStr;
          const isPast  = dateStr < today;
          return (
            <button key={day} disabled={!avail || isPast} onClick={() => onSelect(dateStr)}
              className={`flex items-center justify-center mx-0.5 my-0.5 rounded-xl text-sm font-medium transition-all
                aspect-square min-h-[40px] ${
                isSel              ? "bg-blue-600 text-white font-bold shadow-sm" :
                avail && !isPast   ? "text-gray-900 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100" :
                                     "text-gray-200 cursor-default"
              }`}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
