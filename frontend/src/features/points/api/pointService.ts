import type { CollectionPoint } from '@/lib/database.types';
import { getSupabaseClient } from '@/lib/supabase';
import type { PointFormValues } from '../schemas/point.schema';

export async function createPoint(
  input: PointFormValues
): Promise<CollectionPoint> {
  const supabase = getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    throw new Error('Debe iniciar sesión para crear un punto.');
  }

  const { data, error } = await supabase
    .from('collection_points')
    .insert({
      event_id: input.eventId,
      leader_id: userData.user.id,
      name: input.name.trim(),
      zone_type: input.zoneType,
      latitude: input.latitude,
      longitude: input.longitude,
      status: 'active',
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as CollectionPoint;
}

export const pointService = { createPoint };

export default pointService;