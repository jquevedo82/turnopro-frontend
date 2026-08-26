/**
 * ReviewPage.tsx — Mobile-first.
 * URL: /resena/:token
 * Formulario de una sola pantalla: el link llega por email al completarse la cita.
 * Nunca pide el nombre — ya se conoce del cliente de la cita (ver ReviewsService).
 */
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useReviewByToken, useSubmitReview } from "@/hooks/useReviews";
import { PageLoader } from "@/components/ui/Spinner";

export const ReviewPage = () => {
  const { token = "" } = useParams<{ token: string }>();
  const { data: invite, isLoading } = useReviewByToken(token);
  const submitReview = useSubmitReview();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  if (isLoading) return <PageLoader />;

  const alreadyUsed = !invite || invite.status !== "invitado";

  if (alreadyUsed && !sent) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <p className="font-display text-xl text-gray-600">Ya enviaste tu opinión</p>
        <p className="text-sm text-gray-400 mt-2">Gracias por tomarte el tiempo.</p>
      </div>
    </div>
  );

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-emerald-50">
      <div className="text-center">
        <div className="text-5xl mb-4">🙏</div>
        <p className="font-display text-xl text-emerald-700">¡Gracias por tu opinión!</p>
        <p className="text-sm text-gray-500 mt-2">Le va a servir a otras personas a la hora de elegir.</p>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    if (!rating) return;
    await submitReview.mutateAsync({ token, rating, comment });
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ background: "linear-gradient(180deg, #f0f5ff 0%, #f9fafb 100%)" }}>
      <div style={{ background: "linear-gradient(135deg, #0f2342 0%, #1a3a6b 100%)" }} className="text-white px-4 py-8 text-center">
        <div className="text-4xl mb-3">⭐</div>
        <h1 className="font-display text-2xl font-bold">¿Cómo te fue?</h1>
        <p className="text-blue-300 text-sm mt-1">
          Hola {invite!.reviewerName.split(" ")[0]}, contanos tu experiencia con {invite!.professional.name}
        </p>
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-5">
        <div className="card p-5">
          <label className="form-label block text-center mb-3">Tu calificación</label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="text-3xl leading-none"
                aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
              >
                {n <= rating ? "⭐" : "☆"}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <label className="form-label">Contanos más (opcional)</label>
          <textarea
            className="form-input"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Qué fue lo que más te gustó?"
            maxLength={1000}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!rating || submitReview.isPending}
          className="btn btn-primary btn-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitReview.isPending ? "Enviando..." : "Enviar mi opinión"}
        </button>

        <p className="text-center text-xs text-gray-400 pb-4">TurnoPro • Tu turno en un clic</p>
      </div>
    </div>
  );
};
