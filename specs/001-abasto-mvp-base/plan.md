# Implementation Plan: Base MVP de ABASTO

**Branch**: `[001-abasto-mvp-base]` | **Date**: 2026-08-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-abasto-mvp-base/spec.md`

**Note**: Este plan sigue el flujo de `/speckit-plan` y se apoya en `research.md`, `data-model.md`, `contracts/` y `quickstart.md`.

## Summary

Construir el MVP base de ABASTO como una web app React + Vite + TypeScript respaldada por Supabase para autenticar líderes, revisar su verificación manualmente, registrar puntos de acopio vinculados a eventos activos y publicar un mapa público con disponibilidad actualizada. El enfoque técnico prioriza trazabilidad inmutable, RLS por defecto, almacenamiento privado para evidencia sensible y una vista pública sin fricción para donantes.

## Technical Context

**Language/Version**: TypeScript 5.x para frontend y lógica compartida; SQL/Postgres para persistencia y políticas.

**Primary Dependencies**: React, Vite, Supabase Auth, Supabase Postgres, Supabase Storage, Supabase Realtime, Zustand, TanStack Query, React Hook Form + @hookform/resolvers (resolver de Valibot obligatorio en todo formulario), Valibot, Tailwind CSS, MapLibre, Turf.js, Lucide React.

**Storage**: PostgreSQL vía Supabase, con buckets privados en Supabase Storage para documentos de verificación y evidencia sensible.

**Testing**: Vitest, React Testing Library y Playwright para validación de UI, flujo de acceso y mapa público.

**Target Platform**: Navegadores modernos en escritorio y móvil; backend administrado por Supabase.

**Project Type**: Web application con frontend público/privado y backend de datos y políticas en Supabase.

**Performance Goals**: Carga del mapa público en menos de 3 segundos en el 95% de los casos y decisiones administrativas en menos de 10 minutos por solicitud una vez iniciada la revisión.

**Constraints**: RLS obligatorio, acceso público solo de lectura para el mapa, evidencia sensible en almacenamiento privado, historial inmutable para cambios operativos, soporte multi-evento y comportamiento responsive.

**Scale/Scope**: MVP inicial para un conjunto reducido de líderes y administradores, pero con modelo preparado para múltiples eventos de desastre activos y crecimiento incremental.

---

## Modularity & Component Rules (Strict Guidelines)

Para garantizar la mantenibilidad, escalabilidad y aislamiento de código, **todo el desarrollo frontend debe cumplir estrictamente con los siguientes principios**:

1. **Un solo componente/entidad por archivo**:
   * Queda **prohibido** declarar múltiples componentes React dentro de un mismo archivo `.tsx`.
   * Queda **prohibido** acumular lógica, interfaces, hooks y UI dentro de archivos `index.ts/tsx` o monolíticos. Los archivos `index.ts` se reservan exclusivamente para exportaciones públicas (*barrel exports*).
2. **Separación de responsabilidades**:
   * **`api/`**: Solo contiene llamadas directas a Supabase / RPCs.
   * **`hooks/`**: Concentra las mutaciones y consultas de **TanStack Query**.
   * **`schemas/`**: Mantiene los esquemas de validación de **Valibot**.
   * **`stores/`**: Maneja el estado global del módulo con **Zustand**.
   * **`components/`**: Exclusivamente UI pura y modularizada.
   * **`pages/`**: Vistas de alto nivel que orquestan los componentes de la feature.
3. **Puntos de entrada limpios**:
   * Cada archivo debe tener un propósito único y un nombre descriptivo en `PascalCase` para componentes (`PointForm.tsx`) y `camelCase` para utilidades/hooks (`usePointDetails.ts`).
4. **Formularios estandarizados con React Hook Form**:
   * **Todos** los formularios de la aplicación, sin excepción, deben implementarse con **React Hook Form** (`useForm`), de modo que se disponga siempre del set completo de estados (`isSubmitting`, `isValid`, `isDirty`, `errors`, `touchedFields`, etc.) para controlar la UI.
   * La validación **nunca** se escribe a mano dentro del componente: siempre se conecta mediante el **resolver** correspondiente (`valibotResolver`) apuntando al esquema de Valibot de la feature.
   * El esquema de Valibot es la **única fuente de verdad** del shape del formulario. El tipo de los valores del formulario se obtiene con `InferInput` de Valibot (`type PointFormValues = v.InferInput<typeof pointSchema>`) y ese tipo es el que se pasa a `useForm<PointFormValues>`. Queda prohibido declarar interfaces o tipos de formulario manuales por separado del esquema.
   * Flujo obligatorio por formulario: `schemas/*.schema.ts` (Valibot) → tipo inferido con `InferInput` → `useForm` con `resolver: valibotResolver(schema)` en el componente de `components/` o `pages/` correspondiente → envío delegado al hook de `hooks/` (mutación de TanStack Query).
5. **Reutilización obligatoria del cliente Supabase**:
   * Antes de crear cualquier llamada a Supabase, se debe **revisar primero** si ya existe un cliente inicializado en `lib/supabase.ts`. Está prohibido instanciar clientes de Supabase adicionales o sueltos dentro de `features/*/api/`.
   * Todos los archivos de `api/` deben importar y reutilizar ese cliente único (`import { supabase } from '@/lib/supabase'`), garantizando una sola fuente de conexión, configuración y tipado (`database.types.ts`) para todo el proyecto.
   * No se permite código de conexión duplicado, ad-hoc o desconectado del cliente central; cualquier necesidad nueva (RPC, storage, realtime) se resuelve extendiendo el cliente existente, no creando instancias paralelas.

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Estado: PASS. El plan permanece dentro del stack approved por la constitución, mantiene RLS y almacenamiento privado, no expone datos sensibles al público, respeta la asimetría de acceso por rol y modela la trazabilidad con historial inmutable.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-abasto-mvp-base/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── web-surface.md
└── tasks.md
```

### Source Code (repository root)

frontend/
├── src/
│   ├── app/                        # Providers, router y configuración global
│   │   ├── providers.tsx
│   │   └── App.tsx
│   ├── components/                 # Componentes genéricos y layout global
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   └── PublicShell.tsx
│   │   ├── navigation/
│   │   │   └── Header.tsx
│   │   └── ui/                     # UI primitivas (Botones, Inputs, Modales)
│   ├── features/                   # Arquitectura modular por dominio
│   │   ├── auth/
│   │   │   ├── api/                # authService.ts
│   │   │   ├── components/         # AuthForm.tsx
│   │   │   ├── hooks/              # useLoginMutation.ts, useRegisterMutation.ts
│   │   │   ├── pages/              # LoginPage.tsx, RegisterPage.tsx
│   │   │   ├── schemas/            # auth.schema.ts (Valibot)
│   │   │   ├── stores/             # useAuthStore.ts (Zustand)
│   │   │   └── types/              # auth.types.ts
│   │   ├── verification/
│   │   │   ├── api/                # verificationApi.ts
│   │   │   ├── components/         # VerificationDocumentsForm.tsx, VerificationReviewDrawer.tsx
│   │   │   ├── hooks/              # useVerificationQueue.ts, useSubmitVerification.ts
│   │   │   ├── pages/              # VerificationRequestPage.tsx, AdminVerificationQueuePage.tsx
│   │   │   ├── schemas/            # verification.schema.ts
│   │   │   └── types/              # verification.types.ts
│   │   ├── points/
│   │   │   ├── api/                # pointsApi.ts
│   │   │   ├── components/         # PointForm.tsx, PointMapPicker.tsx, InventoryEditor.tsx, InventoryHistoryList.tsx
│   │   │   ├── hooks/              # useCreatePoint.ts, useInventoryMutation.ts
│   │   │   ├── pages/              # NewPointPage.tsx, PointDetailPage.tsx, PointInventoryPage.tsx
│   │   │   ├── schemas/            # point.schema.ts, inventory.schema.ts
│   │   │   └── utils/              # geometry.ts (Turf.js helpers)
│   │   └── map/
│   │       ├── api/                # mapApi.ts
│   │       ├── components/         # PublicMap.tsx, PublicPointCard.tsx, EventSelector.tsx
│   │       ├── hooks/              # usePublicMapData.ts
│   │       └── pages/              # PublicMapPage.tsx
│   ├── lib/                        # Clientes compartidos e infraestructura
│   │   ├── database.types.ts
│   │   ├── domain.ts
│   │   ├── env.ts
│   │   ├── guards.ts
│   │   ├── queryClient.ts
│   │   └── supabase.ts
│   ├── routes/                     # Definición de rutas y guards
│   │   ├── ProtectedRoute.tsx
│   │   └── router.tsx
│   └── styles/
│       └── tailwind.css
└── tests/
    ├── e2e/
    ├── integration/
    └── unit/

supabase/
├── migrations/
│   ├── 0001_init.sql
│   ├── 0002_security.sql
│   └── 0003_views_and_rpc.sql
├── policies/
│   ├── collection_points.sql
│   ├── disaster_events.sql
│   ├── inventory.sql
│   ├── leader_verification_documents.sql
│   ├── leader_verification_requests.sql
│   └── user_profiles.sql
└── seeds/
    └── 001_initial.sql

**Structure Decision**: Se adopta una aplicación web con un frontend React en `frontend/` y un backend de datos/políticas en `supabase/`. La documentación de diseño queda concentrada en `specs/001-abasto-mvp-base/` para mantener trazabilidad entre la especificación, el plan y las tareas.

## Complexity Tracking

No aplica. No hay violaciones de constitución que requieran justificación adicional.
