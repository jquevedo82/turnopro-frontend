import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock queryClient para no necesitar el provider real
const clearMock = vi.fn();
vi.mock('@/config/queryClient', () => ({ queryClient: { clear: clearMock } }));

// Mock localStorage antes de importar el store
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem:    (key: string) => store[key] ?? null,
    setItem:    (key: string, val: string) => { store[key] = val; },
    removeItem: (key: string) => { delete store[key]; },
    clear:      () => { store = {}; },
  };
})();
vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('sessionStorage', localStorageMock);

describe('auth.store — safeParseUser', () => {
  beforeEach(() => localStorageMock.clear());

  it('devuelve null cuando localStorage está vacío', async () => {
    const { useAuthStore } = await import('./auth.store');
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('devuelve el usuario correctamente cuando el JSON es válido', async () => {
    const user = { id: 1, email: 'dr@test.com', role: 'professional' };
    localStorageMock.setItem('tp_user', JSON.stringify(user));

    vi.resetModules();
    const { useAuthStore } = await import('./auth.store');
    expect(useAuthStore.getState().user).toMatchObject(user);
  });

  it('devuelve null y limpia localStorage cuando el JSON está corrupto', async () => {
    localStorageMock.setItem('tp_user', 'json-invalido-{{{{');

    vi.resetModules();
    const { useAuthStore } = await import('./auth.store');

    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorageMock.getItem('tp_user')).toBeNull();
  });
});

describe('auth.store — logout', () => {
  beforeEach(() => {
    localStorageMock.clear();
    clearMock.mockClear();
  });

  it('limpia localStorage, sessionStorage y llama queryClient.clear()', async () => {
    vi.resetModules();
    vi.mock('@/config/queryClient', () => ({ queryClient: { clear: clearMock } }));
    const { useAuthStore } = await import('./auth.store');

    localStorageMock.setItem('tp_token', 'tok123');
    localStorageMock.setItem('tp_user', JSON.stringify({ id: 1 }));
    localStorageMock.setItem('tp_active_prof', '5');

    useAuthStore.getState().logout();

    expect(localStorageMock.getItem('tp_token')).toBeNull();
    expect(localStorageMock.getItem('tp_user')).toBeNull();
    expect(localStorageMock.getItem('tp_active_prof')).toBeNull();
    expect(clearMock).toHaveBeenCalledOnce();
  });
});
