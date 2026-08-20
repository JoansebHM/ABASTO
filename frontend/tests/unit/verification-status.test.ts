import { describe, expect, it } from 'vitest';
import { requireApproved } from '../../src/lib/guards';
import { VerificationStatus } from '../../src/lib/domain';

describe('verification status access rule', () => {
  it('requires approved verification for operational writes', () => {
    expect(requireApproved(VerificationStatus.Approved)).toBe(true);
  });

  it.each([
    undefined,
    VerificationStatus.Pending,
    VerificationStatus.Rejected,
    VerificationStatus.NotRequired,
  ])('rejects write access for status %s', (status) => {
    expect(requireApproved(status)).toBe(false);
  });
});