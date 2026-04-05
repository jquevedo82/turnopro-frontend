/**
 * WaitingRoomPage.tsx — Pantalla de sala de espera pública.
 * Diseñada para mostrarse en una TV o tablet en la recepción.
 * Sin auth. Acceso: /sala/:slug
 *
 * Estrategia de actualización:
 *   - Poll liviano a /public/:slug/queue-version cada 30s.
 *   - Si queueUpdatedAt cambió → recarga la cola completa.
 *   - La cola también se recarga al montar y cada vez que el timestamp cambia.
 */
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { appointmentsApi } from "@/api/appointments.api";
import type { PublicQueueEntry } from "@/types";

const POLL_INTERVAL_MS = 30_000; // 30 segundos

const STATUS_LABEL: Record<string, string> = {
  arrived:     "Esperando",
  in_progress: "En consulta",
};

const STATUS_COLOR: Record<string, string> = {
  arrived:     "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-green-100 text-green-800 border-green-200",
};

export const WaitingRoomPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [queue, setQueue]             = useState<PublicQueueEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError]             = useState(false);
  const [time, setTime]               = useState(new Date());
  const lastVersionRef                = useRef<string | null>(null);

  // Reloj en tiempo real
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadQueue = async () => {
    if (!slug) return;
    try {
      const data = await appointmentsApi.getPublicQueue(slug);
      setQueue(data);
      setLastUpdated(new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }));
      setError(false);
    } catch {
      setError(true);
    }
  };

  // Carga inicial
  useEffect(() => { loadQueue(); }, [slug]);

  // Polling liviano: compara queueUpdatedAt — si cambió, recarga la cola
  useEffect(() => {
    if (!slug) return;
    const interval = setInterval(async () => {
      try {
        const { queueUpdatedAt } = await appointmentsApi.getQueueVersion(slug);
        if (queueUpdatedAt !== lastVersionRef.current) {
          lastVersionRef.current = queueUpdatedAt;
          await loadQueue();
        }
      } catch {
        // silencioso — si falla el poll, la pantalla sigue mostrando la última cola
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-6 border-b border-gray-800">
        <div>
          <h1 className="text-3xl font-bold text-white">Sala de espera</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-400 mt-1">Actualizado a las {lastUpdated}</p>
          )}
        </div>
        <div className="text-4xl font-mono font-semibold text-gray-200 tabular-nums">
          {time.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 px-10 py-8">
        {error ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-lg">Sin conexión — reintentando…</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-6xl mb-6">🪑</div>
            <p className="text-2xl font-light">No hay pacientes en espera</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {queue.map((entry) => (
              <div
                key={entry.position}
                className={`flex items-center gap-6 px-8 py-6 rounded-2xl border-2 ${STATUS_COLOR[entry.status] ?? "bg-gray-800 text-white border-gray-700"}`}
              >
                {/* Posición */}
                <div className="text-5xl font-bold w-16 text-center opacity-60">
                  {entry.status === "in_progress" ? "▶" : `#${entry.position}`}
                </div>

                {/* Nombre */}
                <div className="flex-1">
                  <div className="text-3xl font-semibold">{entry.name}</div>
                </div>

                {/* Estado */}
                <div className="text-lg font-medium px-4 py-2 rounded-xl bg-white/40">
                  {STATUS_LABEL[entry.status] ?? entry.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-10 py-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-600">
        <span>TurnoPro</span>
        <span>Actualización automática cada 30 segundos</span>
      </footer>
    </div>
  );
};
