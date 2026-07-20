import { describe, it, expect } from 'vitest';
import { optimizedCloudinaryUrl } from './images';

describe('optimizedCloudinaryUrl', () => {
  it('inserta f_auto,q_auto y el ancho pedido después de /upload/', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/turnopro/avatars/xyz.jpg';
    expect(optimizedCloudinaryUrl(url, 200)).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_200/v1234567890/turnopro/avatars/xyz.jpg',
    );
  });

  it('devuelve la URL sin cambios si no es de Cloudinary (storage local)', () => {
    const url = 'https://turnopro-backend.onrender.com/uploads/avatars/xyz.jpg';
    expect(optimizedCloudinaryUrl(url, 200)).toBe(url);
  });

  it('devuelve undefined si la URL es null, undefined o vacía', () => {
    expect(optimizedCloudinaryUrl(null, 200)).toBeUndefined();
    expect(optimizedCloudinaryUrl(undefined, 200)).toBeUndefined();
    expect(optimizedCloudinaryUrl('', 200)).toBeUndefined();
  });
});
