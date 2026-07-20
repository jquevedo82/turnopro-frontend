import { describe, it, expect } from 'vitest';
import { api } from './api';

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
