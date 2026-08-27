/**
 * PhoneInput.tsx
 * Input de teléfono con selector de código de país.
 * Guarda el número completo con código en el valor (ej: +5491155556666).
 * Valida la longitud del número local según el país seleccionado.
 */
import { useState, useEffect } from "react";

interface Country {
  code:   string;
  flag:   string;
  name:   string;
  hint:   string;
  minDigits: number;
  maxDigits: number;
  digitHint: string;
}

export const COUNTRIES: Country[] = [
  {
    code: "+54", flag: "🇦🇷", name: "Argentina",
    hint: "9 11 1234-5678",
    minDigits: 10, maxDigits: 11,
    digitHint: "10 u 11 dígitos (fijo o móvil)",
  },
  {
    code: "+57", flag: "🇨🇴", name: "Colombia",
    hint: "300 123 4567",
    minDigits: 10, maxDigits: 10,
    digitHint: "10 dígitos (ej: 3001234567)",
  },
  {
    code: "+58", flag: "🇻🇪", name: "Venezuela",
    hint: "412 555 6666",
    minDigits: 10, maxDigits: 10,
    digitHint: "10 dígitos (ej: 4121234567)",
  },
];

/** Devuelve el mensaje de error si el número local no cumple la longitud requerida, o null si es válido */
export const validateLocalPhone = (localNumber: string, countryCode: string): string | null => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) return null;
  const digits = localNumber.replace(/\D/g, "");
  if (digits.length === 0) return null; // vacío lo maneja required
  if (digits.length < country.minDigits || digits.length > country.maxDigits) {
    return `${country.name}: ${country.digitHint}`;
  }
  return null;
};

interface PhoneInputProps {
  value:     string;
  onChange:  (value: string) => void;
  className?: string;
  disabled?:  boolean;
  required?:  boolean;
  /** Código de país a preseleccionar cuando `value` está vacío (ej: el país del
   *  profesional en su página de reserva). Si no se pasa, arranca en Argentina. */
  defaultCountryCode?: string;
}

/** Extrae el código de país y el número local de un valor guardado */
const parsePhone = (value: string, fallbackCode = "+54"): { countryCode: string; localNumber: string } => {
  const fallback = COUNTRIES.some(c => c.code === fallbackCode) ? fallbackCode : "+54";
  if (!value) return { countryCode: fallback, localNumber: "" };
  for (const c of COUNTRIES) {
    if (value.startsWith(c.code)) {
      return { countryCode: c.code, localNumber: value.slice(c.code.length).trim() };
    }
  }
  return { countryCode: fallback, localNumber: value };
};

export const PhoneInput = ({
  value, onChange, className = "", disabled = false, required = false, defaultCountryCode,
}: PhoneInputProps) => {
  const parsed = parsePhone(value, defaultCountryCode);

  const [countryCode, setCountryCode] = useState(parsed.countryCode);
  const [localNumber, setLocalNumber] = useState(parsed.localNumber);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    const p = parsePhone(value, defaultCountryCode);
    setCountryCode(p.countryCode);
    setLocalNumber(p.localNumber);
  }, [value, defaultCountryCode]);

  const country = COUNTRIES.find(c => c.code === countryCode) ?? COUNTRIES[0];

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setCountryCode(newCode);
    setError(validateLocalPhone(localNumber, newCode));
    onChange(localNumber ? `${newCode}${localNumber}` : newCode);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^\d\s\-]/g, "");
    setLocalNumber(num);
    setError(validateLocalPhone(num, countryCode));
    onChange(num ? `${countryCode}${num}` : "");
  };

  const handleBlur = () => {
    setError(validateLocalPhone(localNumber, countryCode));
  };

  return (
    <div className={className}>
      <div className="flex">
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
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          placeholder={country.hint}
          className={`form-input rounded-l-none flex-1 focus:z-10 ${error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
          style={{ borderRadius: "0 0.5rem 0.5rem 0" }}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};