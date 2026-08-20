import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../api/inventoryService';
import type { InventoryFormValues } from '../schemas/inventory.schema';

export function useAdjustInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['inventory', 'adjust'],
    mutationFn: (input: InventoryFormValues) =>
      inventoryService.adjustInventory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['points'] });
    },
  });
}

export default useAdjustInventory;