import * as v from 'valibot';

export const inventorySchema = v.object({
  pointId: v.pipe(
    v.string('El punto de acopio es obligatorio.'),
    v.uuid('Debe seleccionar un punto válido.')
  ),
  supplyType: v.pipe(
    v.string('El tipo de suministro es obligatorio.'),
    v.trim(),
    v.minLength(2, 'El tipo de suministro debe tener al menos 2 caracteres.'),
    v.maxLength(
      100,
      'El tipo de suministro no puede superar 100 caracteres.'
    )
  ),
  quantityDelta: v.pipe(
    v.number('La cantidad es obligatoria.'),
    v.integer('La cantidad debe ser un número entero.'),
    v.check(
      (quantity) => quantity !== 0,
      'La cantidad debe ser diferente de cero.'
    )
  ),
  reason: v.optional(
    v.pipe(
      v.string(),
      v.trim(),
      v.maxLength(300, 'El motivo no puede superar 300 caracteres.')
    )
  ),
});

export type InventoryFormValues = v.InferInput<typeof inventorySchema>;

export default inventorySchema;