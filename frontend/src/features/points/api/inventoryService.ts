import { getSupabaseClient } from '@/lib/supabase';
import type { InventoryFormValues } from '../schemas/inventory.schema';

export async function adjustInventory(
  input: InventoryFormValues
): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('rpc_apply_inventory_adjustment', {
    point_uuid: input.pointId,
    supply: input.supplyType.trim(),
    quantity_delta: input.quantityDelta,
    reason: input.reason?.trim() || null,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export const inventoryService = { adjustInventory };

export default inventoryService;