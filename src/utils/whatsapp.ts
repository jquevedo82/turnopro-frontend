const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// wa.me funciona bien en el teléfono (abre la app), pero en PC esa misma URL pasa por
// una cadena de redirects (wa.me → api.whatsapp.com → web.whatsapp.com) que en varios
// navegadores corrompe los emojis del texto precargado. En desktop vamos directo a
// web.whatsapp.com/send para evitar esa cadena. Mismo fix que TuCatálogo (frontend/src/utils/whatsapp.ts).
export function waUrl(phone: string, text: string): string {
  const clean = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(text);
  return isMobile()
    ? `https://wa.me/${clean}?text=${encoded}`
    : `https://web.whatsapp.com/send?phone=${clean}&text=${encoded}`;
}
