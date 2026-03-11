/**
 * ForgotPasswordPage.tsx
 * El usuario ingresa su email y recibe un link de recuperación.
 * Ruta: /forgot-password
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/config/api";
import { Spinner } from "@/components/ui/Spinner";

export const ForgotPasswordPage = () => {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : (msg || "Error al enviar el email"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: "linear-gradient(135deg, #0f2342 0%, #1a3a6b 60%, #1e40af 100%)" }}>
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="font-display text-4xl font-bold text-white mb-1">
            Turno<span className="text-blue-400">Pro</span>
          </div>
          <p className="text-blue-200 text-sm">Panel de gestión</p>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">📬</div>
              <h2 className="font-display text-xl text-white">¡Revisá tu email!</h2>
              <p className="text-blue-100 text-sm">
                Si el email <strong>{email}</strong> está registrado,
                vas a recibir un link para restablecer tu contraseña en los próximos minutos.
              </p>
              <p className="text-blue-200 text-xs">
                El link expira en 1 hora. Revisá también la carpeta de spam.
              </p>
              <Link to="/login"
                className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white
                           font-semibold rounded-xl transition-all text-center text-sm mt-4">
                Volver al login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl text-white mb-2 text-center">
                Recuperar contraseña
              </h2>
              <p className="text-blue-200 text-sm text-center mb-6">
                Ingresá tu email y te enviamos un link para crear una nueva contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-1.5">Email</label>
                  <input
                    type="email" required autoFocus
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                               text-white placeholder-white/40 outline-none focus:border-blue-400
                               focus:ring-2 focus:ring-blue-400/20 text-sm transition-all"
                    placeholder="tu@email.com"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-400/30 text-red-200 text-sm px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60
                             text-white font-semibold rounded-xl transition-all
                             flex items-center justify-center gap-2 mt-2">
                  {loading ? <><Spinner size="sm" /> Enviando...</> : "Enviar link →"}
                </button>
              </form>

              <div className="text-center mt-5">
                <Link to="/login" className="text-blue-300 hover:text-blue-200 text-sm transition-colors">
                  ← Volver al login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
