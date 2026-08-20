# Research de Arquitectura

## 1) Stack de la aplicación

- **Decision**: Construir el MVP como una web app React + Vite + TypeScript respaldada por Supabase.
- **Rationale**: La constitución ya aprueba ese stack y cubre autenticación, base de datos, almacenamiento privado y tiempo real sin agregar infraestructura innecesaria.
- **Alternatives considered**: Next.js, backend custom separado, React Native o Flutter. Se descartan por mayor complejidad y porque no aportan cobertura adicional a los requisitos del MVP.

## 2) Modelo mínimo de datos

- **Decision**: Usar perfiles de usuario, solicitudes de verificación, documentos de verificación, eventos de desastre, puntos de acopio, inventario actual y un ledger inmutable de cambios.
- **Rationale**: Este modelo cubre verificación pendiente/aprobada/rechazada, multi-evento, acceso público al mapa y trazabilidad de cambios sin sobrescribir historial.
- **Alternatives considered**: Una tabla única mutable de inventario o un historial ad hoc separado del estado actual. Ambas opciones debilitan la trazabilidad y hacen más difícil aplicar la regla de historial inmutable.

## 3) Acceso y seguridad

- **Decision**: Enforce Supabase RLS en todas las tablas sensibles, usar buckets privados para evidencia y exponer al público solo vistas/lecturas agregadas.
- **Rationale**: La constitución exige seguridad por diseño, privacidad de documentos y control de acceso estricto por rol.
- **Alternatives considered**: Filtrado solo desde frontend o endpoints abiertos con lógica de permisos en cliente. Se rechazan porque no protegen datos sensibles ni resisten accesos directos a la base.

## 4) Mapa público

- **Decision**: Publicar una vista de solo lectura para el mapa con puntos activos y resumen de inventario del evento activo o consultado.
- **Rationale**: Mantiene acceso anónimo, simplifica consultas del frontend y permite refresco de datos sin duplicar lógica de agregación.
- **Alternatives considered**: Calcular agregados exclusivamente en el cliente o requerir login para consultar el mapa. Ambas opciones empeoran seguridad o fricción de uso.

## 5) Validación y pruebas

- **Decision**: Estandarizar pruebas con Vitest, React Testing Library y Playwright para validar autorización, formularios, mapa público y flujo extremo a extremo.
- **Rationale**: Permite cubrir la UI y las reglas de acceso sin depender de un único tipo de prueba.
- **Alternatives considered**: Usar solo unit tests o solo E2E. Se descartan por cobertura insuficiente en un flujo con permisos y vistas públicas.

## 6) Riesgos a vigilar

- **Decision**: Tratar las ediciones de inventario como cambios auditables sobre un historial inmutable, no como sobrescrituras silenciosas.
- **Rationale**: La constitución prohíbe perder trazabilidad en cambios de recursos.
- **Decision**: Definir desde el inicio la política de filtro por evento en el mapa público y el comportamiento para usuarios anónimos.
- **Rationale**: La especificación soporta múltiples desastres activos y requiere navegación pública sin fricción.
