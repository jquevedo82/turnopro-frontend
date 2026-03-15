/**
 * LoginPage.tsx
 *
 * FIX: Usa window.location.href en vez de navigate() para el redirect post-login.
 * Esto garantiza que el nuevo render lea el localStorage actualizado desde cero,
 * evitando cualquier condición de carrera con el estado de React/Zustand.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/api/auth.api";
import { Spinner } from "@/components/ui/Spinner";

export const LoginPage = () => {
  const { login } = useAuthStore();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { accessToken, user } = await authApi.login(email, password);

      // 1. Guardar en Zustand + localStorage
      login(accessToken, user);

      // 2. Redirigir según rol con replace para que el botón "atrás" no vuelva al login
      //    Usamos window.location para forzar un render limpio que lea el localStorage
      const destination =
        user.role === "superadmin" ? "/admin"     :
        user.role === "secretary"  ? "/secretaria" :
        "/panel";

      window.location.replace(destination);

    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : (msg || "Credenciales incorrectas"));
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
          <h2 className="font-display text-xl text-white mb-6 text-center">Iniciá sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1.5">Email</label>
              <input
                type="email" required autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-sm transition-all"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1.5">Contraseña</label>
              <input
                type="password" required autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-sm transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Spinner size="sm" /> Verificando...</> : "Ingresar →"}
            </button>
          </form>

          <div className="text-center mt-5">
            <Link to="/forgot-password"
              className="text-blue-300 hover:text-blue-200 text-sm transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};