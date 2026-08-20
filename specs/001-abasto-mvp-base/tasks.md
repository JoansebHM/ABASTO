# Tasks: Base MVP de ABASTO

**Input**: Design documents from `/specs/001-abasto-mvp-base/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Stack objetivo**: React + Vite + TypeScript en `frontend/`, Supabase Auth/Postgres/Storage/Realtime para backend administrado, Zustand para estado cliente, TanStack Query para datos remotos, React Hook Form para formularios, Tailwind CSS para UI, MapLibre + Turf.js para mapa y geolocalización, Lucide React para íconos.

**Organization**: Tasks agrupadas por historia de usuario para permitir implementación y validación independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo porque toca archivos distintos y no depende de tareas incompletas
- **[Story]**: `US1`, `US2`, `US3` según la historia de `spec.md`
- Todas las descripciones incluyen rutas de archivo exactas

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización del proyecto web y estructura base alineada al plan técnico.

- [x] T001 Crear la estructura base del workspace en `frontend/src/app/`, `frontend/src/features/`, `frontend/src/lib/`, `frontend/src/routes/`, `frontend/tests/`, `supabase/migrations/`, `supabase/seeds/` y `supabase/policies/` para reflejar el árbol definido en `plan.md`
- [x] T002 Inicializar la app React + Vite + TypeScript en `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/index.html` y `frontend/src/main.tsx` con soporte para alias de rutas y build de desarrollo
- [x] T003 Configurar Tailwind CSS, PostCSS, ESLint/Prettier y variables de entorno en `frontend/tailwind.config.ts`, `frontend/postcss.config.js`, `frontend/.eslintrc.cjs`, `frontend/.prettierrc`, `frontend/.env.example` y `frontend/src/styles/tailwind.css`
      **Checkpoint**: El frontend puede arrancar con Vite y la estructura de carpetas ya está lista para montar el dominio ABASTO.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura compartida que bloquea todos los flujos de usuario porque define persistencia, acceso, tipos y cliente Supabase.

**⚠️ CRITICAL**: Ninguna historia de usuario debe empezar antes de completar esta fase.

- [x] T004 Definir el esquema inicial de Supabase en `supabase/migrations/0001_init.sql` con tablas y enums para `user_profiles`, `leader_verification_requests`, `leader_verification_documents`, `disaster_events`, `collection_points`, `inventory_ledger_entries` e `inventory_snapshots`
- [x] T005 Definir seguridad de datos en `supabase/migrations/0002_security.sql` y `supabase/policies/*.sql` con RLS activo, políticas por rol, buckets privados de Storage para evidencia y acceso anónimo de solo lectura al mapa público
- [x] T006 Crear vistas, funciones SQL y RPCs en `supabase/migrations/0003_views_and_rpc.sql` para `public_map_view`, decisiones de verificación, actualización de inventario basada en ledger y consultas de estado actual
- [x] T007 Sembrar datos mínimos de desarrollo en `supabase/seeds/001_initial.sql` para un administrador general habilitado, un evento de desastre activo y fixtures de prueba para consulta pública
- [x] T008 Crear el cliente Supabase, el proveedor de TanStack Query y la capa de entorno en `frontend/src/lib/supabase.ts`, `frontend/src/lib/queryClient.ts`, `frontend/src/lib/env.ts` y `frontend/src/app/providers.tsx`
- [x] T009 Definir tipos de dominio compartidos y helpers de autorización en `frontend/src/lib/domain.ts`, `frontend/src/lib/guards.ts` y `frontend/src/lib/database.types.ts` para roles, estados de verificación, estados del evento y reglas de acceso
- [x] T010 Montar la jerarquía base de rutas y layouts por intención en `frontend/src/app/App.tsx`, `frontend/src/routes/index.tsx`, `frontend/src/routes/public/`, `frontend/src/routes/private/`, `frontend/src/routes/guards/`, `frontend/src/components/layout/AppShell.tsx`, `frontend/src/components/layout/PublicShell.tsx` y `frontend/src/components/navigation/Header.tsx` — organizar por propósito (público, privado y guards) y asegurar la regla "un componente por archivo" para escalabilidad

**Checkpoint**: La app ya tiene base de datos, RLS, cliente Supabase, tipado de dominio y router para empezar a implementar historias sin rehacer infraestructura.

---

## Phase 3: User Story 1 - Alta y verificación de líderes (Priority: P1)

**Goal**: Permitir registro/login de líderes, envío de solicitud con documentos privados y revisión/aprobación manual por Administrador General con auditoría completa.

**Independent Test**: Un líder puede registrarse, iniciar sesión, cargar documentos, quedar en estado pendiente y un admin puede aprobar o rechazar la solicitud dejando rastro de revisor, fecha y resultado; el líder aprobado pasa a poder escribir, el pendiente/rechazado no.

### Tests for User Story 1

- [ ] T011 [P] [US1] Crear pruebas de flujo de autenticación y verificación en `frontend/tests/integration/auth-verification.spec.ts` cubriendo registro, login, envío de documentos y decisión administrativa
- [ ] T012 [P] [US1] Crear pruebas de políticas de acceso en `frontend/tests/unit/guards.test.ts` y `frontend/tests/unit/verification-status.test.ts` para validar bloqueo de escritura a líderes no verificados

### Implementation for User Story 1 — Formularios y validación

En línea con `plan.md` todos los formularios deben implementarse con React Hook Form y Valibot. Las tareas siguientes separan esquemas, formularios UI y hooks/mutations.

- [x] T013 [P] [US1] Definir esquema Valibot de autenticación en `frontend/src/features/auth/schemas/auth.schema.ts` (exportar tipos con `v.InferInput`)
- [x] T014 [P] [US1] Añadir `valibotResolver` utilitario en `frontend/src/lib/valibotResolver.ts` y exportarlo para uso en todos los formularios
- [x] T015 [P] [US1] Implementar `authService.ts` en `frontend/src/features/auth/api/authService.ts` reutilizando el cliente único de Supabase (`frontend/src/lib/supabase.ts`)
- [x] T016 [P] [US1] Implementar hooks de mutación/consulta con TanStack Query: `frontend/src/features/auth/hooks/useRegisterMutation.ts` y `frontend/src/features/auth/hooks/useLoginMutation.ts` (usar `authService`)
- [x] T017 [US1] Crear el store global de autenticación en `frontend/src/features/auth/stores/useAuthStore.ts` con Zustand para centralizar la sesión, usuario, perfil, estado de verificación, permisos y estados de carga/error del módulo, persistiendo la sesión recibida al completar login y exponiendo acciones para hidratarla y cerrarla
- [x] T018 [P] [US1] Crear componente de UI `AuthForm.tsx` en `frontend/src/features/auth/components/AuthForm.tsx` usando `useForm<...>` con `resolver: valibotResolver(authSchema)` y tipos inferidos desde Valibot
- [x] T019 [US1] Implementar páginas `RegisterPage.tsx` y `LoginPage.tsx` en `frontend/src/features/auth/pages/` que orquesten `AuthForm`, llamen a los hooks de mutación, persistan la sesión con `useAuthStore.setSession`, hidraten el perfil y permisos con `useAuthStore.hydrate` tras autenticación y muestren estados `isSubmitting`, `errors`, `isValid`
- [ ] T020 [P] [US1] Crear pruebas unitarias de integración formulario→resolver en `frontend/tests/unit/auth-form.schema.test.ts` para validar que el `auth.schema.ts` rechaza/acepta ejemplos válidos/inválidos
- [ ] T021 [P] [US1] Crear pruebas de integración para el flujo de registro/login en `frontend/tests/integration/auth-verification.spec.ts` que simulen interacción del formulario, verifiquen llamadas al `authService` y comprueben la persistencia/limpieza de sesión en `useAuthStore` (mocked)

**Checkpoint**: Los formularios de autenticación usan RHF + Valibot, están tipados, y las mutaciones están encapsuladas en hooks reutilizables.

**Checkpoint**: User Story 1 queda funcional de punta a punta y habilita el control de acceso sobre escritura operativa.

---

## Phase 4: User Story 2 - Operación inicial de punto de acopio (Priority: P2)

**Goal**: Permitir a un líder verificado registrar puntos de acopio asociados a eventos activos y declarar/editar inventario inicial con historial inmutable.

**Independent Test**: Un líder aprobado puede crear un punto con ubicación y evento, registrar inventario inicial, ajustar cantidades y ver el historial reflejarse sin sobrescribir el ledger.

### Tests for User Story 2

- [ ] T022 [P] [US2] Crear pruebas de flujo de puntos e inventario en `frontend/tests/integration/points-inventory.spec.ts` cubriendo alta de punto, carga inicial y ajuste posterior
- [ ] T023 [P] [US2] Crear pruebas unitarias de cálculo de inventario y validaciones en `frontend/tests/unit/inventory-ledger.test.ts` y `frontend/tests/unit/point-validation.test.ts`

### Implementation for User Story 2 — Formularios de punto e inventario

Prioridad en validación y tipos: cada formulario de puntos e inventario debe definir su esquema Valibot, inferir tipos y usar `useForm` con `valibotResolver`.

- [ ] T024 [P] [US2] Definir esquema Valibot para `PointForm` en `frontend/src/features/points/schemas/point.schema.ts` (tipos con `v.InferInput`)
- [ ] T025 [P] [US2] Implementar `PointForm.tsx` en `frontend/src/features/points/components/PointForm.tsx` usando `useForm<PointFormValues>` con `resolver: valibotResolver(pointSchema)` y exponer estados de validación
- [ ] T026 [P] [US2] Implementar `PointMapPicker.tsx` en `frontend/src/features/points/components/PointMapPicker.tsx` (componente separado que proporciona coordenadas al formulario sin mezclar lógica en `PointForm`)
- [ ] T027 [P] [US2] Crear `pointService.ts` en `frontend/src/features/points/api/pointService.ts` reutilizando `frontend/src/lib/supabase.ts` y `frontend/src/features/points/hooks/useCreatePoint.ts` (TanStack Query)
- [ ] T028 [P] [US2] Definir esquema Valibot para `InventoryEditor` en `frontend/src/features/points/schemas/inventory.schema.ts` y crear `InventoryEditor.tsx` en `frontend/src/features/points/components/InventoryEditor.tsx` usando React Hook Form
- [ ] T029 [US2] Implementar `inventoryService.ts` en `frontend/src/features/points/api/inventoryService.ts` y hooks `useAdjustInventory.ts` que creen entradas de ledger e invaliden snapshots en `frontend/src/features/points/hooks/`
- [ ] T030 [P] [US2] Añadir pruebas unitarias de validación para `point.schema.ts` y `inventory.schema.ts` en `frontend/tests/unit/point-validation.test.ts` y `frontend/tests/unit/inventory-ledger.test.ts`

**Checkpoint**: Formularios de punto e inventario están validados, tipados, desacoplados (map picker separado) y conectados a servicios reutilizables.

**Checkpoint**: User Story 2 queda operativo y mantiene el historial de cambios de inventario como fuente de verdad.

---

## Phase 5: User Story 3 - Consulta pública y landing inicial (Priority: P3)

**Goal**: Permitir a cualquier visitante acceder a una landing responsive y a un mapa público con puntos activos e inventario disponible sin autenticación.

**Independent Test**: Un usuario anónimo abre la landing, navega el header, visualiza el mapa y consulta inventario actualizado de un punto activo sin crear cuenta.

### Tests for User Story 3

- [ ] T031 [P] [US3] Crear pruebas de UI pública y navegación anónima en `frontend/tests/e2e/public-landing-map.spec.ts` para validar Home, Dashboard y mapa público
- [ ] T032 [P] [US3] Crear pruebas unitarias del loader público y el filtro por evento en `frontend/tests/unit/public-map-loader.test.ts` y `frontend/tests/unit/event-filter.test.ts`

### Implementation for User Story 3 — Formularios públicos y filtros

User Story 3 tiene formularios ligeros (filtros/selector). Aplicar las mismas reglas de validación cuando aplique.

- [ ] T033 [P] [US3] Implementar `EventSelector.tsx` en `frontend/src/features/map/components/EventSelector.tsx` con esquema Valibot `frontend/src/features/map/schemas/event-filter.schema.ts` cuando el selector acepte entrada libre (p.ej. fechas/rango)
- [ ] T034 [P] [US3] Implementar `PublicMapPage.tsx` y `PublicMap.tsx` en `frontend/src/features/map/pages/PublicMapPage.tsx` y `frontend/src/features/map/components/PublicMap.tsx` (el loader público debe usar hooks en `frontend/src/features/map/hooks.ts`)
- [ ] T035 [P] [US3] Añadir pruebas unitarias para los loaders públicos y el `EventSelector` en `frontend/tests/unit/public-map-loader.test.ts` y `frontend/tests/unit/event-filter.test.ts`

**Checkpoint**: Los filtros públicos siguen las reglas de validación, el mapa consume hooks y el loader es testeable.

**Checkpoint**: User Story 3 queda lista para consulta pública sin fricción y sin exponer datos sensibles.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cierre técnico, seguridad, accesibilidad, rendimiento y validación final contra quickstart.

- [ ] T036 [P] Revisar accesibilidad y responsive design en `frontend/src/features/landing/pages/LandingPage.tsx`, `frontend/src/features/map/pages/PublicMapPage.tsx` y `frontend/src/components/layout/AppShell.tsx` para garantizar navegación usable en móvil y escritorio
- [ ] T037 [P] Endurecer seguridad y privacidad en `supabase/migrations/0002_security.sql`, `supabase/policies/*.sql` y `frontend/src/lib/env.ts` validando RLS, storage privado y manejo seguro de variables de entorno
- [ ] T038 Ejecutar la validación final de quickstart en `specs/001-abasto-mvp-base/quickstart.md` y alinear cualquier ajuste necesario en `frontend/tests/` y `supabase/seeds/001_initial.sql`

---

## Cross-cutting: Formularios, schemas y utilidades obligatorias

- [ ] T039 Crear `frontend/src/lib/valibotResolver.ts` — wrapper para `@hookform/resolvers` que exporta `valibotResolver(schema)` y ejemplos en README corto
- [ ] T040 Añadir `frontend/src/features/**/schemas/*.schema.ts` por cada feature que use formularios (auth, verification, points, inventory, map filters)
- [ ] T041 Documentar la convención de formularios en `specs/001-abasto-mvp-base/checklists/form-guidelines.md` explicando: esquema → InferInput → useForm → hooks → servicio
- [ ] T042 Crear pruebas de contrato para formularios: `frontend/tests/unit/form-schema-compat.test.ts` que asegura que `InferInput<typeofschema>` coincide con los tipos usados en `useForm` en archivos ejemplo

---

## Dependencies & Execution Order (delta)

- Mantener las fases y dependencias previas: Setup → Foundational → User Stories (US1→US2→US3 recomendadas)
- Dentro de cada historia: escribir esquemas Valibot primero, luego componentes de formulario (`components/`), luego `api/` servicios y finalmente hooks (`hooks/`) y tests
- `[P]` aplica cuando un task toca archivos distintos (schemas separadas, componentes separadas)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias; puede arrancar de inmediato.
- **Foundational (Phase 2)**: Depende de Setup y bloquea todas las historias de usuario.
- **User Stories (Phase 3+)**: Dependen de Foundational. US1, US2 y US3 pueden avanzar en paralelo si hay capacidad, pero el orden recomendado del MVP es US1 → US2 → US3.
- **Polish (Phase 6)**: Depende de que al menos el MVP funcional esté completo y validado.

### User Story Dependencies

- **US1**: No depende de otras historias; es la base del control de acceso y de la cuenta líder.
- **US2**: Puede implementarse después de Foundational, pero sus escrituras deben respetar `verification_status = approved`; el flujo end-to-end se valida con un líder aprobado semillado o resuelto por US1.
- **US3**: No depende de US1 ni US2 para leer datos públicos, pero sí de Foundational para consumir la vista pública y el evento activo.

### Within Each User Story

- Las pruebas, cuando existen, se escriben primero y deben fallar antes de implementar.
- UI y componentes antes que integración fina.
- Servicios y consultas de Supabase antes que persistencia final en la interfaz.
- Guards y validaciones antes de habilitar acciones de escritura.
- Cada historia debe quedar operativa e independiente antes de pasar a la siguiente.

### Parallel Opportunities

- `T013`, `T014` y `T018` pueden correr en paralelo porque tocan archivos distintos de US1 y no dependen del store.
- `T017` debe completarse antes de integrar el login en `T019` y de validar la persistencia en `T021`.
- `T023` y `T024` pueden correr en paralelo porque separan el formulario de punto y el selector geográfico de US2.
- `T032` y `T033` pueden correr en paralelo porque separan el selector y el mapa público de US3.
- `T035` y `T036` pueden correr en paralelo porque separan UI/accesibilidad y seguridad/políticas.

---

## Parallel Example: User Story 1

```text
# Implementación paralela una vez completada la base:
T013 [P] [US1] Implementar la experiencia de registro e inicio de sesión...
T014 [P] [US1] Implementar el flujo de solicitud de verificación...
```

---

## Implementation Strategy

### MVP First

1. Completar Phase 1 y Phase 2.
2. Implementar US1 y validar registro, carga documental y decisión administrativa.
3. Implementar US2 para habilitar puntos e inventario sobre líderes verificados.
4. Implementar US3 para publicar landing y mapa.
5. Cerrar con Phase 6 y ejecutar `quickstart.md`.

### Incremental Delivery

1. Foundation lista.
2. US1 habilita identidad y control de acceso.
3. US2 agrega operación real de acopios e inventario.
4. US3 expone valor público sin fricción.
5. Se valida cada incremento sin romper el anterior.

### Stack Usage by Phase

- **React + Vite + TypeScript**: estructura de la app, rutas, páginas, componentes y hooks.
- **Supabase Auth**: registro/login, sesión y roles.
- **Supabase Postgres + RLS**: persistencia de perfiles, verificaciones, eventos, puntos e inventario.
- **Supabase Storage**: documentos sensibles y evidencia privada.
- **TanStack Query**: cache, invalidación y sincronización de datos remotos.
- **Zustand**: estado local de autenticación, perfil y permisos.
- **React Hook Form**: formularios de registro, verificación, puntos e inventario.
- **Tailwind CSS**: layout responsive, landing, paneles y estados vacíos.
- **MapLibre + Turf.js**: mapa público, geolocalización y validación espacial.
- **Lucide React**: íconos de navegación, estado y acciones.

---

## Notes

- Cada tarea incluye ruta exacta para que el trabajo pueda ejecutarse sin contexto adicional.
- Las tareas marcadas con `[P]` asumen archivos distintos y ausencia de dependencias incompletas.
- El MVP mínimo sugerido sigue siendo US1, porque desbloquea la seguridad operativa del resto del producto.
- Mantener las políticas y la evidencia privada en Supabase es parte del alcance base, no una optimización posterior.
