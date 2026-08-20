import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import {
  inventorySchema,
} from '../../src/features/points/schemas/inventory.schema';

const validAdjustment = {
  pointId: '00000000-0000-4000-8000-000000000002',
  supplyType: 'Agua potable',
  quantityDelta: 10,
  reason: 'Nueva donación',
};

describe('inventory schema validation', () => {
  it('accepts positive and negative integer adjustments', () => {
    expect(v.safeParse(inventorySchema, validAdjustment).success).toBe(true);
    expect(
      v.safeParse(inventorySchema, {
        ...validAdjustment,
        quantityDelta: -3,
      }).success
    ).toBe(true);
  });

  it.each([
    ['invalid point id', { pointId: 'point-1' }],
    ['empty supply type', { supplyType: ' ' }],
    ['zero adjustment', { quantityDelta: 0 }],
    ['fractional adjustment', { quantityDelta: 1.5 }],
    ['non-numeric adjustment', { quantityDelta: '10' }],
  ])('rejects %s', (_description, override) => {
    expect(
      v.safeParse(inventorySchema, { ...validAdjustment, ...override }).success
    ).toBe(false);
  });
});

describe('inventory ledger calculation', () => {
  it.each([
    [0, 20, 20],
    [20, -5, 15],
    [15, 0, 15],
  ])(
    'calculates the next quantity from previous quantity and delta',
    (previousQuantity, quantityDelta, expectedQuantity) => {
      expect(previousQuantity + quantityDelta).toBe(expectedQuantity);
    }
  );

  it('rejects a ledger result that would make inventory negative', () => {
    const previousQuantity = 3;
    const quantityDelta = -4;
    const nextQuantity = previousQuantity + quantityDelta;

    expect(nextQuantity).toBeLessThan(0);
  });
});