import { useMyReviews, useApproveReview, useRejectReview } from "@/hooks/useReviews";
import { PageLoader } from "@/components/ui/Spinner";
import { formatDateShort } from "@/utils/dates";
import type { ReviewAdmin } from "@/types";

const STATUS_LABEL: Record<ReviewAdmin["status"], string> = {
  invitado: "Invitado",
  pendiente: "Pendiente de moderar",
  publicada: "Publicada",
  rechazada: "Rechazada",
};

export const ReviewsPage = () => {
  const { data: reviews = [], isLoading } = useMyReviews();
  const approve = useApproveReview();
  const reject  = useRejectReview();

  if (isLoading) return <PageLoader />;

  const pending   = reviews.filter((r) => r.status === "pendiente");
  const moderated = reviews.filter((r) => r.status !== "pendiente");

  return (
    <div className="page">
      <div className="section-hd">
        <h1 className="page-title">⭐ Reseñas</h1>
        <span className="text-sm text-gray-400">{reviews.length} en total</span>
      </div>

      {pending.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <span className="card-title">Pendientes de moderar ({pending.length})</span>
          </div>
          {pending.map((r) => (
            <div key={r.id} className="flex items-start gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{r.reviewerName}</span>
                  <span className="text-amber-500 text-sm">{"⭐".repeat(r.rating ?? 0)}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                <div className="text-xs text-gray-400 mt-1">{r.submittedAt && formatDateShort(r.submittedAt)}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => approve.mutate(r.id)} className="btn btn-success btn-sm">✓ Publicar</button>
                <button onClick={() => reject.mutate(r.id)} className="btn btn-outline btn-sm text-red-500 border-red-200">✕ Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">Historial</span>
        </div>
        {moderated.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">⭐</div>
            <p>Todavía no hay reseñas moderadas</p>
          </div>
        ) : (
          moderated.map((r) => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{r.reviewerName}</span>
                  <span className="text-amber-500 text-sm">{"⭐".repeat(r.rating ?? 0)}</span>
                </div>
                {r.comment && <p className="text-xs text-gray-500 mt-0.5">{r.comment}</p>}
              </div>
              <span className={`badge ${r.status === "publicada" ? "badge-success" : "badge-gray"}`}>
                {STATUS_LABEL[r.status]}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
