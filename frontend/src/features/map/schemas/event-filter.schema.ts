import * as v from 'valibot';

export const eventFilterSchema = v.object({
  eventSlug: v.pipe(
    v.string('El evento es obligatorio.'),
    v.minLength(1, 'Debe seleccionar un evento.')
  ),
});

export type EventFilterValues = v.InferInput<typeof eventFilterSchema>;

export default eventFilterSchema;