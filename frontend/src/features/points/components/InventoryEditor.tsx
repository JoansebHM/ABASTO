import { useForm } from 'react-hook-form';
import { valibotResolver } from '@/lib/valibotResolver';
import {
  inventorySchema,
  type InventoryFormValues,
} from '../schemas/inventory.schema';

export interface InventoryEditorProps {
  onSubmit: (values: InventoryFormValues) => void | Promise<void>;
  defaultValues?: Partial<InventoryFormValues>;
  submitLabel?: string;
  isBusy?: boolean;
  className?: string;
}

export function InventoryEditor({
  onSubmit,
  defaultValues,
  submitLabel = 'Guardar ajuste',
  isBusy = false,
  className = '',
}: InventoryEditorProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<InventoryFormValues>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: valibotResolver(inventorySchema),
    defaultValues: {
      pointId: '',
      supplyType: '',
      quantityDelta: undefined,
      reason: '',
      ...defaultValues,
    },
  });

  const busy = isBusy || isSubmitting;

  return (
    <form className={className} noValidate onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="inventory-point-id">Punto de acopio</label>
        <input
          id="inventory-point-id"
          type="text"
          {...register('pointId')}
          aria-invalid={Boolean(errors.pointId)}
          placeholder="ID del punto"
        />
        {errors.pointId && (
          <p role="alert">{String(errors.pointId.message)}</p>
        )}
      </div>

      <div>
        <label htmlFor="inventory-supply-type">Tipo de suministro</label>
        <input
          id="inventory-supply-type"
          type="text"
          {...register('supplyType')}
          aria-invalid={Boolean(errors.supplyType)}
          placeholder="Agua potable"
        />
        {errors.supplyType && (
          <p role="alert">{String(errors.supplyType.message)}</p>
        )}
      </div>

      <div>
        <label htmlFor="inventory-quantity-delta">Ajuste de cantidad</label>
        <input
          id="inventory-quantity-delta"
          type="number"
          step="1"
          {...register('quantityDelta', { valueAsNumber: true })}
          aria-invalid={Boolean(errors.quantityDelta)}
          placeholder="10 o -2"
        />
        {errors.quantityDelta && (
          <p role="alert">{String(errors.quantityDelta.message)}</p>
        )}
      </div>

      <div>
        <label htmlFor="inventory-reason">Motivo</label>
        <textarea
          id="inventory-reason"
          {...register('reason')}
          aria-invalid={Boolean(errors.reason)}
          placeholder="Ingreso de donación o corrección de conteo"
        />
        {errors.reason && <p role="alert">{String(errors.reason.message)}</p>}
      </div>

      <button type="submit" disabled={busy || !isDirty || !isValid}>
        {submitLabel}
      </button>
    </form>
  );
}

export default InventoryEditor;