import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import {
  pointSchema,
} from '../../src/features/points/schemas/point.schema';

const validPoint = {
  eventId: '00000000-0000-4000-8000-000000000001',
  name: 'Centro comunitario',
  zoneType: 'disaster_zone',
  latitude: 6.2442,
  longitude: -75.5812,
};

describe('point schema validation', () => {
  it('accepts a valid point at geographic boundaries', () => {
    expect(
      v.safeParse(pointSchema, {
        ...validPoint,
        latitude: -90,
        longitude: 180,
      }).success
    ).toBe(true);
  });

  it.each([
    ['invalid event id', { eventId: 'event-1' }],
    ['empty name', { name: ' ' }],
    ['invalid zone type', { zoneType: 'warehouse' }],
    ['latitude too low', { latitude: -90.1 }],
    ['latitude too high', { latitude: 90.1 }],
    ['longitude too low', { longitude: -180.1 }],
    ['longitude too high', { longitude: 180.1 }],
  ])('rejects %s', (_description, override) => {
    expect(v.safeParse(pointSchema, { ...validPoint, ...override }).success).toBe(
      false
    );
  });
});