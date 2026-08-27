/**
 * LandingPage.tsx — Página pública en "/".
 * Si ya hay sesión iniciada, redirige directo al panel según el rol (mismo mecanismo
 * que LoginPage: window.location.replace para leer localStorage limpio, sin condición
 * de carrera con el estado de Zustand).
 *
 * Sin sección de precios a propósito: el alta sigue siendo manual (el superadmin la
 * gestiona), así que mostrar precios sin poder comprar en el momento genera fricción.
 * El CTA es un link de WhatsApp con mensaje precargado — mismo patrón que TuCatálogo,
 * sin backend nuevo. Configurar VITE_SUPPORT_WHATSAPP en .env para activarlo.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "@/store/auth.store";
import { waUrl } from "@/utils/whatsapp";
import { PROFESSIONAL_TYPE_OPTIONS } from "@/config/verticals";

const SUPPORT_WHATSAPP = import.meta.env.VITE_SUPPORT_WHATSAPP as string | undefined;
const LEAD_MESSAGE = "Hola! Quiero mi página de reservas en TurnoPro";

const STEPS = [
  { n: 1, title: "Configurás tu página", text: "Nombre, servicios, horarios y listo — no hace falta saber de sistemas." },
  { n: 2, title: "Compartís tu link", text: "Por WhatsApp, Instagram o donde ya estés — tu página, tu nombre." },
  { n: 3, title: "Reservan solos", text: "Tus pacientes o clientes eligen día y horario disponible, sin llamarte." },
  { n: 4, title: "Vos gestionás todo", text: "Un panel simple para ver, confirmar y organizar tu agenda del día." },
];

const FEATURES = [
  { icon: "📅", title: "Página de reservas propia", text: "Un link con tu nombre, tus servicios y tus horarios reales." },
  { icon: "💬", title: "Recordatorios automáticos", text: "Email de confirmación y recordatorio — menos ausencias sin esfuerzo." },
  { icon: "🪑", title: "Sala de espera virtual", text: "Pantalla en vivo para consultorios: quién sigue, sin gritar nombres." },
  { icon: "⭐", title: "Opiniones de tus pacientes", text: "Reseñas reales, moderadas por vos antes de publicarse." },
  { icon: "👥", title: "Panel para tu secretaria", text: "Ella gestiona la agenda sin tener que darle tu usuario." },
  { icon: "🌎", title: "Pensado para la región", text: "Horarios y teléfonos listos para Argentina, Colombia y Venezuela." },
];

const CtaButtons = ({ dark = false }: { dark?: boolean }) => (
  <div className="flex flex-col sm:flex-row gap-3 justify-center">
    {SUPPORT_WHATSAPP ? (
      <a
        href={waUrl(SUPPORT_WHATSAPP, LEAD_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white shadow-sm"
        style={{ background: "#25d366" }}
      >
        💬 Quiero mi página de reservas
      </a>
    ) : (
      <Link
        to="/login"
        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white shadow-sm bg-blue-600"
      >
        Quiero saber más
      </Link>
    )}
    <Link
      to="/login"
      className={`inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold border transition-colors ${
        dark ? "border-white/30 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"
      }`}
    >
      Ya tengo cuenta →
    </Link>
  </div>
);

export const LandingPage = () => {
  const user = useCurrentUser();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (user) {
      const destination =
        user.role === "superadmin" ? "/admin" :
        user.role === "secretary"  ? "/secretaria" :
        "/panel";
      window.location.replace(destination);
    } else {
      setChecked(true);
    }
  }, [user]);

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="font-display text-xl font-bold" style={{ color: "#0f2342" }}>
            Turno<span className="text-blue-600">Pro</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#como-funciona" className="hover:text-blue-600">Cómo funciona</a>
            <a href="#para-quien" className="hover:text-blue-600">Para quién es</a>
            <a href="#que-incluye" className="hover:text-blue-600">Qué incluye</a>
          </nav>
          <Link to="/login" className="text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50">
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className="text-white px-4 sm:px-6 py-16 sm:py-24 text-center"
        style={{ background: "linear-gradient(135deg, #0f2342 0%, #1a3a6b 100%)" }}
      >
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight mb-4">
            Tu agenda, resuelta en un link
          </h1>
          <p className="text-blue-200 text-base sm:text-lg mb-8">
            Página de reservas propia para médicos, psicólogos, esteticistas y cualquier
            profesional que gestiona turnos. Tus pacientes reservan solos, vos ves todo desde un panel simple.
          </p>
          <CtaButtons dark />
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 text-center mb-3">Cómo funciona</h2>
        <p className="text-center text-gray-500 mb-10">Cuatro pasos, sin curva de aprendizaje.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-white rounded-xl border border-gray-200 p-5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white mb-3"
                style={{ background: "#0f2342" }}
              >
                {s.n}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Para quién es */}
      <section id="para-quien" className="bg-gray-50 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 text-center mb-3">Para quién es</h2>
          <p className="text-center text-gray-500 mb-10">TurnoPro se adapta al lenguaje de tu rubro — no es solo para consultorios médicos.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROFESSIONAL_TYPE_OPTIONS.map((t) => (
              <div key={t.value} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <h3 className="font-semibold text-gray-900 mb-1">{t.label}</h3>
                <p className="text-sm text-gray-500">{t.examples}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qué incluye */}
      <section id="que-incluye" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 text-center mb-3">Qué incluye</h2>
        <p className="text-center text-gray-500 mb-10">Todo lo que necesitás para dejar de coordinar por mensajes sueltos.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section
        className="text-white px-4 sm:px-6 py-16 sm:py-20 text-center"
        style={{ background: "linear-gradient(135deg, #0f2342 0%, #1a3a6b 100%)" }}
      >
        <div className="max-w-xl mx-auto">
          <div className="text-4xl mb-4">📅</div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">¿Empezamos con tu página?</h2>
          <p className="text-blue-200 mb-8">Contanos de tu rubro y armamos tu página de reservas.</p>
          <CtaButtons dark />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-100">
        © {new Date().getFullYear()} TurnoPro — Tu turno en un clic
      </footer>
    </div>
  );
};
