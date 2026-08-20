import { beforeEach, describe, expect, it, vi } from 'vitest';

const rpc = vi.fn();

vi.mock('../../src/lib/supabase', () => ({
  getSupabaseClient: () => ({ rpc }),
}));

import { adjustInventory } from '../../src/features/points/api/inventoryService';

describe('inventory service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the inventory RPC with the editor values', async () => {
    rpc.mockResolvedValue({ data: 'ledger-1', error: null });

    const ledgerId = await adjustInventory({
      pointId: 'point-1',
      supplyType: '  Agua potable  ',
      quantityDelta: 10,
      reason: '  Nueva donación  ',
    });

    expect(rpc).toHaveBeenCalledWith('rpc_apply_inventory_adjustment', {
      point_uuid: 'point-1',
      supply: 'Agua potable',
      quantity_delta: 10,
      reason: 'Nueva donación',
    });
    expect(ledgerId).toBe('ledger-1');
  });

  it('propagates RPC errors', async () => {
    rpc.mockResolvedValue({
      data: null,
      error: new Error('resulting quantity cannot be negative'),
    });

    await expect(
      adjustInventory({
        pointId: 'point-1',
        supplyType: 'Agua potable',
        quantityDelta: -20,
        reason: 'Corrección',
      })
    ).rejects.toThrow('resulting quantity cannot be negative');
  });
});