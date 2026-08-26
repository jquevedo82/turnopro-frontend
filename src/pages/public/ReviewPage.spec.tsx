import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockUseReviewByToken = vi.fn();
const mockSubmit = vi.fn().mockResolvedValue(undefined);

vi.mock('@/hooks/useReviews', () => ({
  useReviewByToken: () => mockUseReviewByToken(),
  useSubmitReview:  () => ({ mutateAsync: mockSubmit, isPending: false }),
}));

import { ReviewPage } from './ReviewPage';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/resena/abc123']}>
      <Routes>
        <Route path="/resena/:token" element={<ReviewPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('ReviewPage', () => {
  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('muestra "ya enviaste tu opinión" si la invitación ya fue usada', () => {
    mockUseReviewByToken.mockReturnValue({
      data: { reviewerName: 'Juan Pérez', status: 'pendiente', professional: { name: 'Dra. García' } },
      isLoading: false,
    });

    renderPage();

    expect(screen.getByText('Ya enviaste tu opinión')).toBeInTheDocument();
  });

  it('muestra el saludo con el primer nombre del cliente y del profesional', () => {
    mockUseReviewByToken.mockReturnValue({
      data: { reviewerName: 'Juan Pérez', status: 'invitado', professional: { name: 'Dra. García' } },
      isLoading: false,
    });

    renderPage();

    expect(screen.getByText(/Hola Juan, contanos tu experiencia con Dra. García/)).toBeInTheDocument();
  });

  it('no deja enviar sin seleccionar una calificación', () => {
    mockUseReviewByToken.mockReturnValue({
      data: { reviewerName: 'Juan Pérez', status: 'invitado', professional: { name: 'Dra. García' } },
      isLoading: false,
    });

    renderPage();

    expect(screen.getByText('Enviar mi opinión')).toBeDisabled();
  });

  it('envía la reseña con la calificación elegida y muestra agradecimiento', async () => {
    mockUseReviewByToken.mockReturnValue({
      data: { reviewerName: 'Juan Pérez', status: 'invitado', professional: { name: 'Dra. García' } },
      isLoading: false,
    });

    renderPage();

    fireEvent.click(screen.getByLabelText('4 estrellas'));
    fireEvent.click(screen.getByText('Enviar mi opinión'));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({ token: 'abc123', rating: 4, comment: '' });
      expect(screen.getByText('¡Gracias por tu opinión!')).toBeInTheDocument();
    });
  });
});
