# Contrato de Superficie Web

## Público

### `GET /`

- Landing responsive con header, hero y footer.
- Debe mostrar accesos visibles a Home y Dashboard.

### `GET /map`

- Vista pública de solo lectura con puntos activos del evento consultado.
- Debe mostrar nombre del punto, ubicación y resumen del inventario disponible.
- No requiere autenticación.

## Autenticación

### `POST /auth/register`

- Crea cuentas para líderes con estado de verificación pendiente.
- No permite autoalta de administrador general.

### `POST /auth/login`

- Autentica líderes y administradores previamente habilitados.

## Líder verificado

### `POST /leader/verification-requests`

- Envía la solicitud de verificación con documentos de identidad y certificación de cargo.

### `POST /leader/points`

- Registra un punto de acopio para un evento activo.
- Requiere `verification_status = approved`.

### `POST /leader/points/:pointId/inventory`

- Declara inventario inicial o ajusta inventario existente.
- Cada cambio debe generar historial auditable.

## Administrador general

### `GET /admin/verification-requests`

- Lista solicitudes pendientes de revisión.

### `POST /admin/verification-requests/:requestId/decision`

- Aprueba o rechaza una solicitud.
- Debe registrar revisor, fecha y resultado.

## Reglas transversales

- Cualquier escritura operativa requiere rol autorizado y verificación aprobada cuando aplique.
- Los datos sensibles de verificación nunca se exponen en vistas públicas.
- El mapa público solo puede consumir vistas de lectura agregadas.
