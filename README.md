# TurnoPro — Frontend

> Sistema SaaS de gestión de turnos médicos. Panel para profesionales, página pública de reservas y panel superadmin.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)

---

## Índice

- [Descripción](#descripción)
- [Stack](#stack)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Rutas](#rutas)
- [Flujos principales](#flujos-principales)
- [Autenticación](#autenticación)
- [Cómo extender](#cómo-extender)
- [Scripts](#scripts)
- [Problemas comunes](#problemas-comunes)

---

## Descripción

TurnoPro Frontend conecta directamente con el [backend NestJS](../turnopro-backend). Tiene tres vistas principales:

- **Página pública** (`/:slug`) — el paciente reserva su turno sin necesidad de login
- **Panel del profesional** (`/panel/*`) — agenda, servicios, horarios, clientes y perfil
- **Panel superadmin** (`/admin/*`) — alta de profesionales y gestión de suscripciones

---

## Stack

| Librería | Versión | Uso |
|---|---|---|
| React | ^18.2.0 | Framework UI |
| TypeScript | ^5.2.2 | Tipado estático |
| Vite | ^5.0.0 | Build tool y dev server |
| TailwindCSS | ^3.3.6 | Estilos utilitarios |
| React Router DOM | ^6.20.0 | Navegación y rutas |
| TanStack React Query | ^5.0.0 | Caché y llamadas al backend |
| Axios | ^1.6.0 | Cliente HTTP con interceptores JWT |
| React Hook Form | ^7.49.0 | Gestión de formularios |
| Zustand | ^4.4.0 | Estado global (autenticación) |
| date-fns | ^3.0.0 | Formateo de fechas |

---

## Estructura del proyecto

```
src/
├── config/
│   └── api.ts                  # axios con interceptores JWT automáticos
├── api/                        # una función por endpoint del backend
│   ├── auth.api.ts
│   ├── appointments.api.ts
│   ├── availability.api.ts
│   ├── professionals.api.ts
│   ├── services.api.ts
│   ├── schedule.api.ts
│   ├── clients.api.ts
│   ├── plans.api.ts
│   └── public.api.ts
├── hooks/                      # React Query — useQuery / useMutation por entidad
│   ├── useAppointments.ts
│   ├── useAvailability.ts
│   ├── useServices.ts
│   ├── useSchedule.ts
│   ├── useProfessionals.ts
│   └── usePublic.ts
├── store/
│   └── auth.store.ts           # Zustand: token + usuario autenticado
├── types/
│   └── index.ts                # interfaces que mapean los DTOs del backend
├── utils/
│   ├── toast.ts                # notificaciones (reemplazable por react-toastify)
│   └── dates.ts                # formateo de fechas en español
├── components/
│   ├── ui/
│   │   ├── Badge.tsx           # StatusBadge para estados de citas
│   │   └── Spinner.tsx
│   └── layout/
│       ├── Sidebar.tsx         # menú del panel profesional
│       ├── AdminSidebar.tsx    # menú del panel superadmin
│       ├── ProfessionalLayout.tsx
│       └── AdminLayout.tsx
└── pages/
    ├── auth/
    │   ├── LoginPage.tsx
    │   └── ProtectedRoute.tsx
    ├── public/                 # reserva del paciente
    │   ├── PublicPage.tsx
    │   └── components/
    │       ├── ServiceSelector.tsx
    │       ├── BookingCalendar.tsx
    │       ├── SlotPicker.tsx
    │       ├── BookingForm.tsx
    │       └── BookingSuccess.tsx
    ├── professional/
    │   ├── dashboard/
    │   │   ├── DashboardPage.tsx   # agenda de hoy
    │   │   └── TomorrowPage.tsx    # agenda de mañana + WhatsApp
    │   ├── services/
    │   │   └── ServicesPage.tsx
    │   ├── schedule/
    │   │   └── SchedulePage.tsx
    │   ├── profile/
    │   │   └── ProfilePage.tsx
    │   └── ClientsPage.tsx
    ├── superadmin/
    │   ├── AdminDashboard.tsx
    │   ├── ProfessionalsPage.tsx
    │   └── PlansPage.tsx
    └── client/
        └── ClientAppointmentPage.tsx  # gestión de cita por token
```

---

## Instalación

```bash
# 1. Clonar el repo
git clone https://github.com/tu-usuario/turnopro-frontend.git
cd turnopro-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Asegurarse de que el backend esté corriendo en localhost:3000

# 5. Levantar el servidor de desarrollo
npm run dev
# → http://localhost:5173
```

---

## Variables de entorno

```env
# URL del backend en producción.
# En desarrollo dejar vacío — el proxy de Vite redirige /api → localhost:3000
VITE_API_URL=

# URL base del frontend (para los links de WhatsApp y emails)
VITE_APP_URL=http://localhost:5173
```

> **Nota:** En desarrollo no hay que tocar el `.env`. El proxy configurado en `vite.config.ts` maneja la redirección automáticamente.

---

## Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/login` | Público | Login unificado |
| `/:slug` | Público | Página de reserva del profesional. Ej: `/dr-garcia` |
| `/cita/:token` | Público | El paciente gestiona su cita (confirmar / cancelar) |
| `/panel` | Profesional | Agenda de hoy |
| `/panel/manana` | Profesional | Agenda de mañana + recordatorios WhatsApp |
| `/panel/servicios` | Profesional | CRUD de servicios |
| `/panel/horarios` | Profesional | Plantilla semanal + excepciones / feriados |
| `/panel/clientes` | Profesional | Listado de clientes |
| `/panel/perfil` | Profesional | Perfil público y reglas de reserva |
| `/admin` | Superadmin | Dashboard con alertas de vencimiento |
| `/admin/profesionales` | Superadmin | Alta y gestión de suscripciones |
| `/admin/planes` | Superadmin | CRUD de planes |

---

## Flujos principales

### Reserva del paciente (`/:slug`)

El flujo está dividido en 4 pasos dentro de la misma página:

1. **Elegir servicio** — muestra los servicios activos del profesional
2. **Elegir fecha** — calendario que solo habilita días con slots disponibles
3. **Elegir horario** — grilla de slots para esa fecha y servicio
4. **Ingresar datos** — nombre, email, teléfono y nota opcional

Al confirmar, el backend crea la cita y envía el email. El paciente ve una pantalla de éxito con el resumen.

### Recordatorios WhatsApp (`/panel/manana`)

1. La página muestra los turnos confirmados del día siguiente
2. El botón **"Enviar WhatsApp"** abre `wa.me` con el mensaje pre-cargado (fecha, hora, links de confirmar y cancelar)
3. Automáticamente marca el recordatorio como enviado en el backend para no enviarlo dos veces

### Gestión de cita del paciente (`/cita/:token`)

El email enviado al paciente incluye un link con su token único. Desde ahí puede:
- Confirmar asistencia
- Cancelar (si está dentro del plazo configurado por el profesional)
- Ver todos los detalles de la cita

---

## Autenticación

### JWT + Zustand

Tras el login, el token y los datos del usuario se guardan en `localStorage` (`tp_token` y `tp_user`). Zustand los lee al inicializar para mantener la sesión entre recargas.

### Interceptor de axios (`src/config/api.ts`)

- **Request:** adjunta `Authorization: Bearer <token>` automáticamente en cada llamada
- **Response:** si el backend responde `401`, hace logout. `ProtectedRoute` redirige al login sin reload completo

### ProtectedRoute

Lee el token directamente de `localStorage` para evitar condiciones de carrera con Zustand en el primer render. Si el rol no coincide, redirige al panel correcto.

---

## Cómo extender

### Agregar una página al panel del profesional

1. Crear el componente en `src/pages/professional/NuevaPagina.tsx`
2. Importarlo en `src/App.tsx` y agregar `<Route path="nueva">` dentro del bloque `/panel`
3. Agregar el link en `src/components/layout/Sidebar.tsx` dentro del array `MENU_ITEMS`

### Agregar una llamada al backend

1. Agregar la función en el archivo correspondiente de `src/api/`
2. Crear el hook con `useQuery` o `useMutation` en `src/hooks/`
3. Usar el hook en el componente

### Agregar un campo al formulario de perfil

1. Agregar el campo a la interfaz `Professional` en `src/types/index.ts`
2. Agregarlo a la interfaz `ProfileForm` en `ProfilePage.tsx`
3. Agregar el `<input {...register("nuevo_campo")} />` en el formulario
4. Agregarlo también en `update-profile.dto.ts` del backend

### Cambiar el sistema de notificaciones toast

Todo está encapsulado en `src/utils/toast.ts`. Para usar `react-toastify` u otra librería, solo hay que modificar ese archivo sin tocar ningún componente.

---

## Scripts

```bash
npm run dev       # servidor de desarrollo con HMR → http://localhost:5173
npm run build     # compila TypeScript y genera el bundle en /dist
npm run preview   # sirve el build de producción → http://localhost:4173
npm run lint      # ESLint sobre todo src/
```

---

## Problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| Login redirige de vuelta al login | JWT_SECRET diferente entre firma y verificación | Verificar que el backend use `registerAsync` y que el `.env` tenga `JWT_SECRET` definido |
| Error al guardar perfil | Endpoint requiere rol superadmin | Usar `PATCH /professionals/me`, no `/:id` |
| Calendario sin días disponibles | Horarios no configurados | El profesional debe activar al menos un día en `/panel/horarios` |
| Error CORS en desarrollo | Proxy Vite no activo | Verificar que `VITE_API_URL` esté vacío en el `.env` |
| WhatsApp no abre el chat correcto | Teléfono sin código de país | El teléfono del cliente debe incluir `+54` (o el código correspondiente) |
| Token inválido en endpoints protegidos | `sub: 0` es falsy en JS | Verificar que `jwt.strategy.ts` use `payload.sub === undefined` y no `!payload.sub` |

---

## Relacionado

- [turnopro-backend](../turnopro-backend) — API NestJS + TypeORM + MySQL
