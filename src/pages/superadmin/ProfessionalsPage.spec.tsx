import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfessionalsPage } from './ProfessionalsPage';

// Mocks de hooks y dependencias
const mockUpdateMutate = vi.fn();

vi.mock('@/hooks/useProfessionals', () => ({
  useProfessionals:        () => ({ data: [
    { id: 1, name: 'Dr. García', email: 'garcia@test.com', slug: 'dr-garcia', profession: 'Médico', isActive: true },
  ], isLoading: false }),
  useCreateProfessional:   () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateProfessional:   () => ({ mutateAsync: mockUpdateMutate, isPending: false }),
  useActivateProfessional: () => ({ mutateAsync: vi.fn() }),
  useDeactivateProfessional: () => ({ mutate: vi.fn() }),
}));

vi.mock('@tanstack/react-query', () => ({
  QueryClient:    class { constructor() {} clear() {} invalidateQueries() {} },
  useQuery:       () => ({ data: [] }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation:    ({ mutationFn }: any) => ({ mutateAsync: mutationFn, mutate: mutationFn, isPending: false }),
}));

vi.mock('@/api/plans.api',  () => ({ plansApi: { getAll: vi.fn() } }));
vi.mock('@/utils/toast',    () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/components/ui/Spinner', () => ({ PageLoader: () => <div>Loading</div> }));
vi.mock('@/components/ui/Badge',   () => ({ StatusBadge: ({ status }: any) => <span>{status}</span> }));
vi.mock('@/utils/dates',           () => ({ formatDateShort: (d: string) => d }));
vi.mock('@/components/ui/PhoneInput', () => ({ PhoneInput: () => <input data-testid="phone-input" /> }));

describe('ProfessionalsPage — edición de profesional', () => {
  beforeEach(() => {
    mockUpdateMutate.mockReset();
    mockUpdateMutate.mockResolvedValue({});
  });

  it('muestra el botón Editar por cada profesional', () => {
    render(<ProfessionalsPage />);
    expect(screen.getByRole('button', { name: /editar dr. garcía/i })).toBeInTheDocument();
  });

  it('abre el formulario de edición con los datos precargados al hacer click en Editar', () => {
    render(<ProfessionalsPage />);
    fireEvent.click(screen.getByRole('button', { name: /editar dr. garcía/i }));

    expect(screen.getByDisplayValue('Dr. García')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Médico')).toBeInTheDocument();
    // El email fue removido del form de edición — se muestra en la lista pero no se edita
    // El slug aparece como campo readOnly (no editable)
    expect(screen.getByDisplayValue('dr-garcia')).toBeInTheDocument();
  });

  it('cierra el formulario de edición al hacer click en Cancelar', () => {
    render(<ProfessionalsPage />);
    fireEvent.click(screen.getByRole('button', { name: /editar dr. garcía/i }));
    expect(screen.getByDisplayValue('Dr. García')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByDisplayValue('Dr. García')).not.toBeInTheDocument();
  });

  it('no muestra el formulario de edición al inicio', () => {
    render(<ProfessionalsPage />);
    expect(screen.queryByText(/editando:/i)).not.toBeInTheDocument();
  });
});
