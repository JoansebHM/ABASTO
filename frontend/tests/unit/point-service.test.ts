import { beforeEach, describe, expect, it, vi } from 'vitest';

const insert = vi.fn();
const select = vi.fn();
const single = vi.fn();
const getUser = vi.fn();

vi.mock('../../src/lib/supabase', () => ({
  getSupabaseClient: () => ({
    auth: { getUser },
    from: () => ({
      insert,
      select,
      single,
    }),
  }),
}));

import { createPoint } from '../../src/features/points/api/pointService';

describe('point service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insert.mockReturnValue({
      select: () => ({ single }),
    });
    getUser.mockResolvedValue({
      data: { user: { id: 'leader-1' } },
      error: null,
    });
    single.mockResolvedValue({
      data: {
        id: 'point-1',
        event_id: 'event-1',
        leader_id: 'leader-1',
        name: 'Centro comunitario',
        zone_type: 'disaster_zone',
        latitude: 6.2442,
        longitude: -75.5812,
        status: 'active',
      },
      error: null,
    });
  });

  it('inserts a point for the authenticated leader', async () => {
    const point = await createPoint({
      eventId: 'event-1',
      name: '  Centro comunitario  ',
      zoneType: 'disaster_zone',
      latitude: 6.2442,
      longitude: -75.5812,
    });

    expect(insert).toHaveBeenCalledWith({
      event_id: 'event-1',
      leader_id: 'leader-1',
      name: 'Centro comunitario',
      zone_type: 'disaster_zone',
      latitude: 6.2442,
      longitude: -75.5812,
      status: 'active',
    });
    expect(point.id).toBe('point-1');
  });

  it('rejects point creation without an authenticated user', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(
      createPoint({
        eventId: 'event-1',
        name: 'Centro comunitario',
        zoneType: 'disaster_zone',
        latitude: 6.2442,
        longitude: -75.5812,
      })
    ).rejects.toThrow('Debe iniciar sesión para crear un punto.');
    expect(insert).not.toHaveBeenCalled();
  });
});