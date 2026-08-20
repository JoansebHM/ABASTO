export enum Role {
  LeaderDisaster = 'leader_disaster',
  LeaderCollection = 'leader_collection',
  AdminGeneral = 'admin_general',
}

export enum VerificationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  NotRequired = 'not_required',
}

export enum EventStatus {
  Active = 'active',
  Inactive = 'inactive',
  Archived = 'archived',
}

export type ZoneType = 'disaster_zone' | 'collection_zone' | 'other';

export interface DomainEnums {
  Role: typeof Role;
  VerificationStatus: typeof VerificationStatus;
  EventStatus: typeof EventStatus;
}

export const Domain: DomainEnums = {
  Role,
  VerificationStatus,
  EventStatus,
};

export default Domain;
