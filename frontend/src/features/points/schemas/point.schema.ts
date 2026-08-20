import * as v from 'valibot';
import type { ZoneType } from '@/lib/domain';

const zoneTypes: ZoneType[] = [
  'disaster_zone',
  'collection_zone',
  'other',
];

export const pointSchema = v.object({
  eventId: v.pipe(
    v.string('El evento es obligatorio.'),
    v.uuid('Debe seleccionar un evento válido.')
  ),
  name: v.pipe(
    v.string('El nombre del punto es obligatorio.'),
    v.trim(),
    v.minLength(2, 'El nombre del punto debe tener al menos 2 caracteres.'),
    v.maxLength(120, 'El nombre del punto no puede superar 120 caracteres.')
  ),
  zoneType: v.picklist(zoneTypes, 'Debe seleccionar un tipo de zona válido.'),
  latitude: v.pipe(
    v.number('La latitud es obligatoria.'),
    v.minValue(-90, 'La latitud debe ser mayor o igual a -90.'),
    v.maxValue(90, 'La latitud debe ser menor o igual a 90.')
  ),
  longitude: v.pipe(
    v.number('La longitud es obligatoria.'),
    v.minValue(-180, 'La longitud debe ser mayor o igual a -180.'),
    v.maxValue(180, 'La longitud debe ser menor o igual a 180.')
  ),
});

export type PointFormValues = v.InferInput<typeof pointSchema>;

export default pointSchema;