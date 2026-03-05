/**
 * main.tsx — Punto de entrada de la aplicación React.
 * Monta el árbol de componentes con los providers globales:
 *   - QueryClientProvider: caché de datos del servidor (React Query)
 *   - BrowserRouter: navegación con React Router
 */
import React          from 'react'
import ReactDOM       from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App   from './App'
import './index.css'

// Configuración global de React Query
// Para cambiar el tiempo de cache: modificar staleTime
// Para cambiar reintentos en error: modificar retry
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos — datos considerados frescos
      retry:     1,              // Reintenta 1 vez en caso de error
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {/* DevTools: solo visible en desarrollo */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
