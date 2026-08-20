import { getSupabaseClient } from '@/lib/supabase';

export interface PublicMapRow {
  event_id: string;
  event_name: string;
  event_slug: string;
  point_id: string;
  point_name: string;
  zone_type: string;
  latitude: number;
  longitude: number;
  supply_type: string;
  quantity: number;
}

export async function getPublicMapData(): Promise<PublicMapRow[]> {
  const { data, error } = await getSupabaseClient()
    .from('public_map_view')
    .select('*')
    .order('event_name')
    .order('point_name');

  if (error) {
    throw error;
  }

  return (data ?? []) as PublicMapRow[];
}

export const mapService = { getPublicMapData };

export default mapService;