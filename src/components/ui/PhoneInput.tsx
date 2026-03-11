/**
 * PhoneInput.tsx
 * Input de teléfono con selector de código de país.
 * Guarda el número completo con código en el valor (ej: +5491155556666)
 */
import { useState, useEffect } from "react";

interface Country {
  code:   string;
  flag:   string;
  name:   string;
  hint:   string;
}

export const COUNTRIES: Country[] = [
  { code: "+54", flag: "🇦🇷", name: "Argentina", hint: "9 11 1234-5678" },
  { code: "+58", flag: "🇻🇪", name: "Venezuela", hint: "412 555 6666"   },
];

interface PhoneInputProps {
  value:     string;
  onChange:  (value: string) => void;
  className?: string;
  disabled?:  boolean;
  required?:  boolean;
}

/** Extrae el código de país y el número local de un valor guardado */
const parsePhone = (value: string): { countryCode: string; localNumber: string } => {
  if (!value) return { countryCode: "+54", localNumber: "" };
  for (const c of COUNTRIES) {
    if (value.startsWith(c.code)) {
      return { countryCode: c.code, localNumber: value.slice(c.code.length).trim() };
    }
  }
  return { countryCode: "+54", localNumber: value };
};

export const PhoneInput = ({
  value, onChange, className = "", disabled = false, required = false,
}: PhoneInputProps) => {
  const parsed = parsePhone(value);

  // Estado interno para el código de país — así persiste aunque el número esté vacío
  const [countryCode, setCountryCode] = useState(parsed.countryCode);
  const [localNumber, setLocalNumber] = useState(parsed.localNumber);

  // Sincronizar si el value externo cambia (ej: al resetear el form)
  useEffect(() => {
    const p = parsePhone(value);
    setCountryCode(p.countryCode);
    setLocalNumber(p.localNumber);
  }, [value]);

  const country = COUNTRIES.find(c => c.code === countryCode) ?? COUNTRIES[0];

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setCountryCode(newCode);
    // Siempre emitir el valor actualizado, incluso si el número está vacío
    onChange(localNumber ? `${newCode}${localNumber}` : newCode);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^\d\s\-]/g, "");
    setLocalNumber(num);
    onChange(num ? `${countryCode}${num}` : "");
  };

  return (
    <div className={`flex ${className}`}>
      {/* Selector de código de país */}
      <select
        value={countryCode}
        onChange={handleCountryChange}
        disabled={disabled}
        className="form-input rounded-r-none border-r-0 w-28 flex-shrink-0
                   bg-gray-50 text-gray-700 text-sm font-medium cursor-pointer focus:z-10"
        style={{ borderRadius: "0.5rem 0 0 0.5rem" }}
      >
        {COUNTRIES.map(c => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>

      {/* Input del número local */}
      <input
        type="tel"
        value={localNumber}
        onChange={handleNumberChange}
        disabled={disabled}
        required={required}
        placeholder={country.hint}
        className="form-input rounded-l-none flex-1 focus:z-10"
        style={{ borderRadius: "0 0.5rem 0.5rem 0" }}
      />
    </div>
  );
};