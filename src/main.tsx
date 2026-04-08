/**
 * main.tsx — Punto de entrada de la aplicación React.
 * Monta el árbol de componentes con los providers globales:
 *   - QueryClientProvider: caché de datos del servidor (React Query)
 *   - BrowserRouter: navegación con React Router
 */
import React          from 'react'
import ReactDOM       from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './config/queryClient'
import App   from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {/* DevTools: solo visible en desarrollo */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </React.StrictMode>,
)
