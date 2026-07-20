/**
 * config/api.ts
 * Instancia axios configurada con la baseURL del backend.
 *
 * FIX: El interceptor 401 ya NO usa window.location.href (causaba reload completo).
 * Ahora solo limpia el token. El ProtectedRoute se encarga de redirigir al login.
 *
 * Para cambiar la URL del backend: modificar VITE_API_URL en .env
 */
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Adjunta el token JWT en cada request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el backend responde 401: solo limpia la sesión.
// NO usar window.location.href acá — causaría reload y perdería el estado de React.
// El ProtectedRoute detecta automáticamente que isAuthenticated=false y redirige.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Solo logout si ya había un token (evita logout durante el intento de login)
      const hasToken = useAuthStore.getState().token;
      if (hasToken) {
        useAuthStore.getState().logout();
      }
    }
    // Sin esto, err.message es el genérico de axios ("Request failed with status
    // code 400") — el mensaje real que arma el backend (ej. "El horario ya no está
    // disponible") queda solo en err.response.data.message, invisible para el usuario
    // en los lugares que muestran error?.message directo (BookingForm, etc.)
    const backendMessage = err.response?.data?.message;
    if (backendMessage) {
      err.message = Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage;
    }
    return Promise.reject(err);
  }
);
