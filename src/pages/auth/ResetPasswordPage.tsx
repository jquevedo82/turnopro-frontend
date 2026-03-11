/**
 * ResetPasswordPage.tsx
 * El usuario llega desde el link del email con ?token=xxx
 * Ingresa su nueva contraseña y confirma.
 * Ruta: /reset-password?token=xxx
 */
import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/config/api";
import { Spinner } from "@/components/ui/Spinner";

export const ResetPasswordPage = () => {
  const [searchParams]                  = useSearchParams();
  const navigate                        = useNavigate();
  const token                           = searchParams.get("token") ?? "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState("");

  // Token inválido o ausente
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
           style={{ background: "linear-gradient(135deg, #0f2342 0%, #1a3a6b 60%, #1e40af 100%)" }}>
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-white font-semibold mb-2">Link inválido</h2>
          <p className="text-blue-200 text-sm mb-6">
            Este link de recuperación no es válido. Solicitá uno nuevo.
          </p>
          <Link to="/forgot-password"
            className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white
                       font-semibold rounded-xl transition-all text-sm">
            Solicitar nuevo link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres");
    }
    if (password !== confirm) {
      return setError("Las contraseñas no coinciden");
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : (msg || "Error al restablecer la contraseña"));
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
          {success ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">✅</div>
              <h2 className="font-display text-xl text-white">¡Contraseña actualizada!</h2>
              <p className="text-blue-100 text-sm">
                Tu contraseña fue cambiada correctamente. Vas a ser redirigido al login en unos segundos.
              </p>
              <Link to="/login"
                className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white
                           font-semibold rounded-xl transition-all text-center text-sm mt-2">
                Ir al login ahora →
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl text-white mb-2 text-center">
                Nueva contraseña
              </h2>
              <p className="text-blue-200 text-sm text-center mb-6">
                Ingresá tu nueva contraseña. Mínimo 6 caracteres.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-1.5">
                    Nueva contraseña
                  </label>
                  <input
                    type="password" required autoFocus autoComplete="new-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                               text-white placeholder-white/40 outline-none focus:border-blue-400
                               focus:ring-2 focus:ring-blue-400/20 text-sm transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-1.5">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password" required autoComplete="new-password"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20
                               text-white placeholder-white/40 outline-none focus:border-blue-400
                               focus:ring-2 focus:ring-blue-400/20 text-sm transition-all"
                    placeholder="Repetí la contraseña"
                  />
                </div>

                {password && confirm && password !== confirm && (
                  <p className="text-red-300 text-xs">Las contraseñas no coinciden</p>
                )}

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
                  {loading ? <><Spinner size="sm" /> Actualizando...</> : "Guardar nueva contraseña →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
