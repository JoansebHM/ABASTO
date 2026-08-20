import { Controller, useForm } from 'react-hook-form';
import { valibotResolver } from '@/lib/valibotResolver';
import { pointSchema, type PointFormValues } from '../schemas/point.schema';
import { PointMapPicker } from './PointMapPicker';

export interface PointFormProps {
  onSubmit: (values: PointFormValues) => void | Promise<void>;
  defaultValues?: Partial<PointFormValues>;
  submitLabel?: string;
  isBusy?: boolean;
  className?: string;
}

export function PointForm({
  onSubmit,
  defaultValues,
  submitLabel = 'Guardar punto',
  isBusy = false,
  className = '',
}: PointFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<PointFormValues>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: valibotResolver(pointSchema),
    defaultValues: {
      eventId: '',
      name: '',
      zoneType: 'disaster_zone',
      latitude: undefined,
      longitude: undefined,
      ...defaultValues,
    },
  });

  const busy = isBusy || isSubmitting;

  return (
    <form className={className} noValidate onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="eventId">Evento de desastre</label>
        <input
          id="eventId"
          type="text"
          {...register('eventId')}
          aria-invalid={Boolean(errors.eventId)}
          placeholder="ID del evento"
        />
        {errors.eventId && (
          <p role="alert">{String(errors.eventId.message)}</p>
        )}
      </div>

      <div>
        <label htmlFor="name">Nombre del punto</label>
        <input
          id="name"
          type="text"
          {...register('name')}
          aria-invalid={Boolean(errors.name)}
          placeholder="Centro comunitario"
        />
        {errors.name && <p role="alert">{String(errors.name.message)}</p>}
      </div>

      <div>
        <label htmlFor="zoneType">Tipo de zona</label>
        <select
          id="zoneType"
          {...register('zoneType')}
          aria-invalid={Boolean(errors.zoneType)}
        >
          <option value="disaster_zone">Zona de desastre</option>
          <option value="collection_zone">Zona de recolección</option>
          <option value="other">Otra zona</option>
        </select>
        {errors.zoneType && (
          <p role="alert">{String(errors.zoneType.message)}</p>
        )}
      </div>

      <Controller
        name="latitude"
        control={control}
        render={({ field: latitudeField }) => (
          <Controller
            name="longitude"
            control={control}
            render={({ field: longitudeField }) => (
              <PointMapPicker
                value={{
                  latitude: latitudeField.value,
                  longitude: longitudeField.value,
                }}
                onChange={({ latitude, longitude }) => {
                  latitudeField.onChange(latitude);
                  longitudeField.onChange(longitude);
                }}
              />
            )}
          />
        )}
      />
      {(errors.latitude || errors.longitude) && (
        <p role="alert">
          {String(errors.latitude?.message ?? errors.longitude?.message)}
        </p>
      )}

      <button type="submit" disabled={busy || !isDirty || !isValid}>
        {submitLabel}
      </button>
    </form>
  );
}

export default PointForm;