import { Role, VerificationStatus } from './domain';

export function isAdmin(role?: string): boolean {
  return role === Role.AdminGeneral;
}

export function isLeader(role?: string): boolean {
  return role === Role.LeaderDisaster || role === Role.LeaderCollection;
}

export function canCreatePoint(
  role?: string,
  verificationStatus?: string
): boolean {
  return isLeader(role) && verificationStatus === VerificationStatus.Approved;
}

export function canAdjustInventory(
  role?: string,
  verificationStatus?: string
): boolean {
  return isLeader(role) && verificationStatus === VerificationStatus.Approved;
}

export function requireApproved(verificationStatus?: string): boolean {
  return verificationStatus === VerificationStatus.Approved;
}

export default {
  isAdmin,
  isLeader,
  canCreatePoint,
  canAdjustInventory,
  requireApproved,
};
