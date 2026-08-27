import { describe, it, expect, afterEach, vi } from 'vitest';
import { api } from './api';

describe('config/api — validación de VITE_API_URL', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('explota al importar si estamos en PROD y falta VITE_API_URL', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_API_URL', '');
    vi.resetModules();

    await expect(import('./api')).rejects.toThrow('VITE_API_URL no está configurada');
  });

  it('no explota en PROD si VITE_API_URL está configurada', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_API_URL', 'https://turnopro-backend.onrender.com/api');
    vi.resetModules();

    await expect(import('./api')).resolves.toBeDefined();
  });

  it('no explota fuera de PROD aunque falte VITE_API_URL (desarrollo local con proxy)', async () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('VITE_API_URL', '');
    vi.resetModules();

    await expect(import('./api')).resolves.toBeDefined();
  });
});

const getRejectedHandler = () => (api.interceptors.response as any).handlers[0].rejected;

describe('api response interceptor — mensaje de error', () => {
  it('reemplaza el mensaje genérico de axios por el message del backend', async () => {
    const rejected = getRejectedHandler();
    const err: any = { response: { status: 400, data: { message: 'El horario seleccionado ya no está disponible' } } };

    await expect(rejected(err)).rejects.toBe(err);
    expect(err.message).toBe('El horario seleccionado ya no está disponible');
  });

  it('une un array de mensajes (ValidationPipe) en un solo string', async () => {
    const rejected = getRejectedHandler();
    const err: any = { response: { status: 400, data: { message: ['el email es inválido', 'el teléfono es requerido'] } } };

    await expect(rejected(err)).rejects.toBe(err);
    expect(err.message).toBe('el email es inválido, el teléfono es requerido');
  });

  it('deja err.message intacto si el backend no mandó un message', async () => {
    const rejected = getRejectedHandler();
    const err: any = { message: 'Network Error', response: undefined };

    await expect(rejected(err)).rejects.toBe(err);
    expect(err.message).toBe('Network Error');
  });
});
