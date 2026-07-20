import { describe, it, expect, afterEach } from 'vitest';
import { waUrl } from './whatsapp';

const setUserAgent = (ua: string) => {
  Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });
};

describe('waUrl', () => {
  afterEach(() => {
    setUserAgent('node.js');
  });

  it('usa wa.me en teléfono (Android/iPhone)', () => {
    setUserAgent('Mozilla/5.0 (Linux; Android 13; SM-A146M)');
    expect(waUrl('+5491112345678', 'Hola 👋')).toBe(
      `https://wa.me/5491112345678?text=${encodeURIComponent('Hola 👋')}`,
    );
  });

  it('usa web.whatsapp.com/send en PC, evitando la cadena de redirects que corrompe emojis', () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    expect(waUrl('+5491112345678', 'Hola 👋')).toBe(
      `https://web.whatsapp.com/send?phone=5491112345678&text=${encodeURIComponent('Hola 👋')}`,
    );
  });

  it('limpia el teléfono a solo dígitos sin importar el formato de entrada', () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    expect(waUrl('+54 911 1234 5678', 'x')).toContain('phone=5491112345678');
  });
});
