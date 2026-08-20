# Quickstart de Validación

## Prerrequisitos

- Proyecto Supabase configurado para el entorno de desarrollo.
- Dependencias instaladas para el frontend React + Vite.
- Variables de entorno con URL y claves del proyecto Supabase.

## Validación 1: landing pública

1. Inicia la aplicación web.
2. Abre la ruta pública principal.
3. Verifica que el header, el hero y el footer sean responsive.
4. Confirma que el header muestre accesos a Home y Dashboard.

**Resultado esperado**: Un visitante anónimo puede navegar la landing sin autenticarse.

## Validación 2: alta y revisión de líder

1. Registra un usuario con rol de líder.
2. Inicia sesión y envía la solicitud con documento de identidad y certificación de cargo.
3. Entra con una cuenta de administrador general.
4. Revisa la solicitud y apruébala o recházala.

**Resultado esperado**: La solicitud queda con estado pendiente, aprobado o rechazado, y la decisión conserva revisor y fecha.

## Validación 3: punto de acopio e inventario

1. Usa un líder con verificación aprobada.
2. Crea un punto de acopio asociado a un evento activo.
3. Declara inventario inicial y luego realiza un ajuste manual.

**Resultado esperado**: El punto queda activo, el inventario actual se actualiza y el historial conserva todas las entradas.

## Validación 4: mapa público

1. Abre la vista pública del mapa en modo anónimo.
2. Selecciona un punto activo.
3. Revisa que el inventario visible coincida con el último estado publicado.

**Resultado esperado**: El mapa muestra puntos activos e inventario actualizado sin exigir autenticación.

## Validación 5: control de acceso

1. Intenta crear un punto con una cuenta pendiente o rechazada.
2. Intenta editar inventario sin verificación aprobada.

**Resultado esperado**: El sistema bloquea la escritura operativa y explica que se requiere verificación aprobada.

## Notas operativas

- Las pruebas automatizadas deben cubrir autorización, formularios, flujo administrativo y mapa público.
- Las migraciones de Supabase deben aplicarse antes de validar flujos de escritura.
