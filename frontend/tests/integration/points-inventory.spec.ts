import { beforeEach, describe, expect, it, vi } from 'vitest';

const insert = vi.fn();
const getUser = vi.fn();
const rpc = vi.fn();

vi.mock('../../src/lib/supabase', () => ({
  getSupabaseClient: () => ({
    auth: { getUser },
    from: () => ({
      insert,
    }),
    rpc,
  }),
}));

import { adjustInventory } from '../../src/features/points/api/inventoryService';
import { createPoint } from '../../src/features/points/api/pointService';

const pointInput = {
  eventId: '00000000-0000-4000-8000-000000000001',
  name: 'Centro comunitario',
  zoneType: 'disaster_zone' as const,
  latitude: 6.2442,
  longitude: -75.5812,
};

const point = {
  id: '00000000-0000-4000-8000-000000000002',
  event_id: pointInput.eventId,
  leader_id: '00000000-0000-4000-8000-000000000003',
  name: pointInput.name,
  zone_type: pointInput.zoneType,
  latitude: pointInput.latitude,
  longitude: pointInput.longitude,
  status: 'active',
};

describe('points and inventory integration flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({
      data: { user: { id: point.leader_id } },
      error: null,
    });
    insert.mockReturnValue({
      select: () => ({
        single: vi.fn().mockResolvedValue({ data: point, error: null }),
      }),
    });
    rpc
      .mockResolvedValueOnce({ data: 'ledger-initial', error: null })
      .mockResolvedValueOnce({ data: 'ledger-adjustment', error: null });
  });

  it('creates a point, declares inventory, and applies a later adjustment', async () => {
    const createdPoint = await createPoint(pointInput);
    const initialLedgerId = await adjustInventory({
      pointId: createdPoint.id,
      supplyType: 'Agua potable',
      quantityDelta: 20,
      reason: 'Carga inicial',
    });
    const adjustmentLedgerId = await adjustInventory({
      pointId: createdPoint.id,
      supplyType: 'Agua potable',
      quantityDelta: -5,
      reason: 'Entrega registrada',
    });

    expect(createdPoint.event_id).toBe(pointInput.eventId);
    expect(initialLedgerId).toBe('ledger-initial');
    expect(adjustmentLedgerId).toBe('ledger-adjustment');
    expect(insert).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenNthCalledWith(
      1,
      'rpc_apply_inventory_adjustment',
      {
        point_uuid: createdPoint.id,
        supply: 'Agua potable',
        quantity_delta: 20,
        reason: 'Carga inicial',
      }
    );
    expect(rpc).toHaveBeenNthCalledWith(
      2,
      'rpc_apply_inventory_adjustment',
      {
        point_uuid: createdPoint.id,
        supply: 'Agua potable',
        quantity_delta: -5,
        reason: 'Entrega registrada',
      }
    );
  });
});