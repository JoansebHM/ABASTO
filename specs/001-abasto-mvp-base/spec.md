# Feature Specification: Base MVP de ABASTO

**Feature Branch**: `[001-abasto-mvp-base]`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "Necesito implementar la funcionalidad base y MVP de ABASTO..."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Alta y verificacion de lideres (Priority: P1)

Como aspirante a lider de zona (desastre o recoleccion), quiero registrarme y autenticarme para enviar mi solicitud de verificacion, y como Administrador General quiero aprobar o rechazar manualmente esa solicitud revisando la documentacion, para asegurar que solo actores confiables puedan operar funciones criticas.

**Why this priority**: Sin identidad validada no es posible habilitar operaciones de inventario, puntos de acopio ni trazabilidad confiable.

**Independent Test**: Puede probarse de extremo a extremo registrando un lider, iniciando sesion, enviando documentos y completando una revision administrativa con resultado aprobado o rechazado.

**Acceptance Scenarios**:

1. **Given** un usuario sin cuenta que selecciona rol de lider, **When** completa registro y autenticacion con datos validos, **Then** el sistema crea su cuenta en estado pendiente de verificacion y permite cargar su documentacion.
2. **Given** un Administrador General autenticado, **When** revisa una solicitud pendiente con documento de identidad y certificacion de cargo, **Then** puede marcarla como aprobada o rechazada y se notifica el resultado al solicitante.
3. **Given** un lider rechazado o pendiente, **When** intenta acceder a funciones de escritura operativa, **Then** el sistema bloquea el acceso e indica que requiere verificacion aprobada.

---

### User Story 2 - Operacion inicial de punto de acopio (Priority: P2)

Como lider verificado, quiero registrar mi punto de acopio y declarar/editar manualmente el inventario inicial disponible para que el sistema refleje capacidad real de ayuda por zona.

**Why this priority**: Esta historia habilita el primer valor operativo del producto al crear oferta visible de suministros por punto.

**Independent Test**: Puede probarse creando un punto de acopio con ubicacion geografica y ejecutando altas/ediciones de inventario, validando persistencia y consistencia.

**Acceptance Scenarios**:

1. **Given** un lider con verificacion aprobada, **When** registra un punto de acopio indicando nombre, tipo de zona y ubicacion geografica, **Then** el sistema crea el punto con estado activo y lo asocia al lider responsable.
2. **Given** un punto de acopio activo del lider verificado, **When** declara existencias iniciales por tipo de suministro y cantidad, **Then** el inventario queda disponible para consulta.
3. **Given** inventario ya declarado, **When** el lider edita cantidades o corrige items, **Then** el sistema actualiza el estado disponible conservando historial de cambios operativos.

---

### User Story 3 - Consulta publica y landing inicial (Priority: P3)

Como ciudadano o donante sin cuenta, quiero entrar a una landing clara y consultar un mapa interactivo publico con puntos de acopio activos e inventario disponible en tiempo real para decidir a donde dirigir ayuda de forma rapida.

**Why this priority**: Maximiza alcance y utilidad social al eliminar friccion para consulta y orientar decisiones de donacion.

**Independent Test**: Puede probarse en sesion anonima cargando la landing, navegando encabezado y mapa, y verificando visualizacion de puntos e inventario actualizado.

**Acceptance Scenarios**:

1. **Given** un visitante no autenticado, **When** accede a la pagina principal, **Then** visualiza una landing responsive con header, hero y footer, y un header con accesos a Home y Dashboard.
2. **Given** un visitante no autenticado en el mapa publico, **When** selecciona un punto de acopio activo, **Then** puede ver su inventario disponible sin crear cuenta.
3. **Given** cambios de inventario publicados por lideres, **When** un visitante consulta el mapa, **Then** observa disponibilidad actualizada en la vista publica.

---

### Edge Cases

- Intento de registro de lider con documento de identidad ya asociado a otra solicitud activa.
- Solicitudes con documentacion incompleta, ilegible o inconsistente entre identidad y certificacion de cargo.
- Lider autenticado pero no verificado intentando registrar punto o editar inventario.
- Punto de acopio activo sin inventario declarado aun (debe mostrarse como disponible sin existencias).
- Inventario actualizado simultaneamente por dos sesiones del mismo lider.
- Consulta publica cuando no existen puntos activos para un evento de desastre.
- Navegacion desde header hacia Dashboard por usuario anonimo (debe redirigir a autenticacion o pantalla de acceso).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema MUST permitir registro y autenticacion para los roles Lider de Zona de Desastre y Lider de Zona de Recoleccion.
- **FR-002**: El sistema MUST permitir autenticacion para el rol Administrador General mediante cuentas previamente habilitadas por operacion interna.
- **FR-003**: El sistema MUST crear toda cuenta de lider con estado de verificacion pendiente hasta decision administrativa.
- **FR-004**: El sistema MUST permitir que un Administrador General revise manualmente solicitudes de lider y apruebe o rechace cada una en base a documento de identidad y certificacion de cargo.
- **FR-005**: El sistema MUST registrar fecha, revisor y resultado de cada decision de verificacion de lider.
- **FR-006**: El sistema MUST bloquear cualquier accion de escritura operativa a lideres no verificados, incluyendo registro de punto e inventario.
- **FR-007**: El sistema MUST permitir a un lider verificado registrar uno o mas puntos de acopio con nombre, tipo de zona y ubicacion geografica.
- **FR-008**: El sistema MUST asociar cada punto de acopio a un evento de desastre activo para soportar operacion multi-desastre.
- **FR-009**: El sistema MUST permitir a un lider verificado declarar inventario inicial por punto de acopio, incluyendo tipo de suministro y cantidad disponible.
- **FR-010**: El sistema MUST permitir edicion manual posterior del inventario declarado por parte del lider responsable del punto.
- **FR-011**: El sistema MUST exponer un mapa publico accesible sin autenticacion con todos los puntos de acopio activos del evento consultado.
- **FR-012**: El sistema MUST mostrar en el mapa publico el inventario disponible por punto con datos actualizados.
- **FR-013**: El sistema MUST ofrecer una landing inicial responsive con secciones header, hero y footer.
- **FR-014**: El sistema MUST incluir en el header de la landing accesos visibles a Home y Dashboard.
- **FR-015**: El sistema MUST aplicar control de acceso por rol para que cada usuario solo pueda ejecutar acciones permitidas por su perfil y estado de verificacion.

### Key Entities _(include if feature involves data)_

- **User Account**: Representa a una persona con rol de lider o administrador; incluye estado de autenticacion, rol y estado de verificacion.
- **Leader Verification Request**: Solicitud de validacion de un lider con evidencia documental, estado (pendiente/aprobado/rechazado), revisor y fecha de decision.
- **Disaster Event**: Evento activo de desastre al que se asocian puntos, inventario y consultas publicas.
- **Collection Point**: Punto de acopio registrado por un lider verificado; incluye nombre, tipo de zona, ubicacion geografica, estado operativo y responsable.
- **Inventory Item**: Registro de disponibilidad de un suministro en un punto de acopio con cantidad actual y marca temporal de actualizacion.
- **Public Map View**: Vista de consulta abierta que agrega puntos activos e inventario disponible para usuarios anonimos.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Al menos 95% de postulantes a lider completan registro, autenticacion y envio de documentos en 5 minutos o menos.
- **SC-002**: El 100% de lideres pendientes o rechazados queda impedido de registrar puntos de acopio o editar inventario.
- **SC-003**: Al menos 95% de decisiones de verificacion administrativa se completan en menos de 10 minutos por solicitud, una vez iniciada la revision.
- **SC-004**: Al menos 95% de consultas del mapa publico muestran puntos activos e inventario en 3 segundos o menos.
- **SC-005**: Al menos 90% de usuarios anonimos en pruebas de usabilidad identifica correctamente desde la landing como volver a Home y como ir a Dashboard en el primer intento.

## Assumptions

- El alta de cuentas de Administrador General se realiza fuera del flujo de autoregistro y antes del uso operativo del MVP.
- El MVP cubre declaracion y edicion manual de inventario inicial; transferencias avanzadas entre puntos quedan para fases posteriores.
- Cada lider verificado gestiona puntos bajo su responsabilidad y no edita inventario de puntos de otros lideres.
- El concepto de "tiempo real" para consulta publica se interpreta como disponibilidad actualizada tras cada cambio publicado por lideres sin requerir refresco manual complejo por parte del usuario final.
- El MVP prioriza experiencia web responsive para navegadores modernos en movil y escritorio.
