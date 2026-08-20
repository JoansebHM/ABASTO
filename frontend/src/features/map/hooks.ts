import { useQuery } from '@tanstack/react-query';
import { mapService } from './api/mapService';

export function usePublicMapData() {
  return useQuery({
    queryKey: ['public-map'],
    queryFn: mapService.getPublicMapData,
    staleTime: 30_000,
  });
}

export default usePublicMapData;