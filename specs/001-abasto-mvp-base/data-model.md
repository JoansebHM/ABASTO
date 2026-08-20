# Modelo de Datos

## UserProfile

- `id` - UUID, igual al usuario autenticado en Supabase.
- `full_name` - Nombre visible del usuario.
- `role` - `leader_disaster`, `leader_collection` o `admin_general`.
- `verification_status` - `pending`, `approved`, `rejected` o `not_required`.
- `created_at` - Marca temporal de creación.
- `updated_at` - Marca temporal de actualización.

### Relaciones

- Un `UserProfile` puede tener cero o una `LeaderVerificationRequest` activa o resuelta.
- Un `UserProfile` con rol de líder puede ser responsable de varios `CollectionPoint`.

## LeaderVerificationRequest

- `id` - UUID.
- `user_id` - Referencia a `UserProfile`.
- `status` - `pending`, `approved`, `rejected`.
- `reviewed_by` - Referencia al admin que revisó la solicitud.
- `reviewed_at` - Fecha de decisión.
- `decision_note` - Justificación breve de aprobación o rechazo.
- `submitted_at` - Fecha de envío.
- `created_at` - Marca temporal.

### Relaciones

- Una solicitud pertenece a un solo usuario.
- Una solicitud puede tener varios documentos de soporte.

## LeaderVerificationDocument

- `id` - UUID.
- `request_id` - Referencia a `LeaderVerificationRequest`.
- `document_type` - `identity_card` o `role_certificate`.
- `storage_path` - Ruta privada en Supabase Storage.
- `mime_type` - Tipo MIME.
- `uploaded_at` - Fecha de carga.

### Relaciones

- Cada documento pertenece a una solicitud de verificación.
- El acceso es privado y solo se expone mediante URLs firmadas de corta vida.

## DisasterEvent

- `id` - UUID.
- `name` - Nombre del evento.
- `status` - `active`, `inactive` o `archived`.
- `starts_at` - Inicio del evento.
- `ends_at` - Fin del evento, si aplica.
- `slug` - Identificador legible para consultas.
- `created_at` - Marca temporal.

### Relaciones

- Un evento puede tener muchos `CollectionPoint`.
- El mapa público siempre filtra por un evento activo o consultado.

## CollectionPoint

- `id` - UUID.
- `event_id` - Referencia a `DisasterEvent`.
- `leader_id` - Referencia a `UserProfile`.
- `name` - Nombre del punto.
- `zone_type` - Tipo de zona declarado por el líder.
- `latitude` - Coordenada geográfica.
- `longitude` - Coordenada geográfica.
- `status` - `active` o `inactive`.
- `created_at` - Marca temporal.
- `updated_at` - Marca temporal.

### Relaciones

- Un punto pertenece a un evento y a un líder responsable.
- Un punto puede tener varios registros de inventario asociados.

## InventorySnapshot

- `id` - UUID.
- `point_id` - Referencia a `CollectionPoint`.
- `supply_type` - Tipo de suministro.
- `quantity` - Cantidad actual disponible.
- `updated_at` - Marca temporal de última actualización.
- `source_ledger_id` - Referencia al último movimiento que produjo el estado actual.

### Relaciones

- Un snapshot resume el estado actual visible en el mapa y en el panel del líder.
- El snapshot nunca reemplaza el historial; solo refleja el último estado calculado.

## InventoryLedgerEntry

- `id` - UUID.
- `point_id` - Referencia a `CollectionPoint`.
- `supply_type` - Tipo de suministro.
- `operation_type` - `initial_declaration` o `manual_adjustment`.
- `quantity_delta` - Cambio aplicado.
- `previous_quantity` - Cantidad anterior registrada.
- `new_quantity` - Cantidad resultante.
- `created_by` - Usuario que ejecutó el cambio.
- `created_at` - Marca temporal.
- `reason` - Motivo de la corrección o ajuste.

### Relaciones

- Cada entrada es inmutable.
- Cada ajuste actualiza el snapshot actual, pero conserva el evento original.

## PublicMapView

- Vista derivada que une eventos activos, puntos activos y snapshots actuales.
- Expone solo los campos necesarios para consulta anónima.
- No incluye documentos de verificación ni datos sensibles del líder.

## Reglas de validación

- Un líder solo puede crear o editar puntos si su verificación está aprobada.
- Un punto solo puede existir asociado a un evento de desastre.
- La edición de inventario debe generar una nueva entrada de ledger y actualizar el snapshot.
- Los documentos de verificación deben almacenarse en storage privado.
