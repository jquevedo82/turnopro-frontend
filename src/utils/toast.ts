/**
 * utils/toast.ts — Sistema de notificaciones toast simple.
 * Para reemplazar con react-toastify u otra librería: modificar solo este archivo.
 */
const show = (msg: string, type: "success"|"error"|"info") => {
  const el = document.createElement("div");
  const colors = { success: "#10b981", error: "#ef4444", info: "#1a56db" };
  el.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:${colors[type]}; color:white; padding:12px 20px;
    border-radius:10px; font-size:14px; font-family:"DM Sans",sans-serif;
    box-shadow:0 4px 20px rgba(0,0,0,0.15); animation:slideIn 0.3s ease;
    max-width:320px; line-height:1.4;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
};

export default {
  success: (msg: string) => show(msg, "success"),
  error:   (msg: string) => show(msg, "error"),
  info:    (msg: string) => show(msg, "info"),
};
