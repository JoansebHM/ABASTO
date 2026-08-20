import { describe, expect, it } from 'vitest';
import {
  canAdjustInventory,
  canCreatePoint,
  isAdmin,
  isLeader,
} from '../../src/lib/guards';
import { Role, VerificationStatus } from '../../src/lib/domain';

describe('authorization guards', () => {
  it('allows approved leaders to create points and adjust inventory', () => {
    expect(canCreatePoint(Role.LeaderDisaster, VerificationStatus.Approved)).toBe(
      true
    );
    expect(
      canAdjustInventory(Role.LeaderCollection, VerificationStatus.Approved)
    ).toBe(true);
  });

  it.each([
    VerificationStatus.Pending,
    VerificationStatus.Rejected,
    VerificationStatus.NotRequired,
  ])('blocks point and inventory writes for %s leaders', (status) => {
    expect(canCreatePoint(Role.LeaderDisaster, status)).toBe(false);
    expect(canAdjustInventory(Role.LeaderCollection, status)).toBe(false);
  });

  it('does not treat administrators or unknown roles as operational leaders', () => {
    expect(isAdmin(Role.AdminGeneral)).toBe(true);
    expect(isLeader(Role.AdminGeneral)).toBe(false);
    expect(canCreatePoint(Role.AdminGeneral, VerificationStatus.Approved)).toBe(
      false
    );
    expect(canAdjustInventory('unknown', VerificationStatus.Approved)).toBe(
      false
    );
  });
});