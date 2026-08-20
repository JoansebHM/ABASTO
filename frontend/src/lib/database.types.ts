import { Role, VerificationStatus, EventStatus, ZoneType } from './domain';

export interface UserProfile {
  id: string;
  full_name: string;
  role: Role;
  verification_status: VerificationStatus;
  created_at: string | null;
  updated_at: string | null;
}

export interface LeaderVerificationRequest {
  id: string;
  user_id: string;
  status: VerificationStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  decision_note?: string | null;
  submitted_at?: string | null;
  created_at?: string | null;
}

export interface LeaderVerificationDocument {
  id: string;
  request_id: string;
  document_type: 'identity_card' | 'role_certificate';
  storage_path: string;
  mime_type: string;
  uploaded_at?: string | null;
}

export interface DisasterEvent {
  id: string;
  name: string;
  status: EventStatus;
  starts_at?: string | null;
  ends_at?: string | null;
  slug?: string | null;
  created_at?: string | null;
}

export interface CollectionPoint {
  id: string;
  event_id: string;
  leader_id: string;
  name: string;
  zone_type: ZoneType;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive';
  created_at?: string | null;
  updated_at?: string | null;
}

export interface InventorySnapshot {
  id: string;
  point_id: string;
  supply_type: string;
  quantity: number;
  updated_at?: string | null;
  source_ledger_id?: string | null;
}

export interface InventoryLedgerEntry {
  id: string;
  point_id: string;
  supply_type: string;
  operation_type: 'initial_declaration' | 'manual_adjustment';
  quantity_delta: number;
  previous_quantity: number;
  new_quantity: number;
  created_by: string;
  created_at?: string | null;
  reason?: string | null;
}

export interface PublicMapPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  inventory_summary: Array<{ supply_type: string; quantity: number }>;
}

export default {};
