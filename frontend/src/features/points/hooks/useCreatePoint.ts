import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pointService } from '../api/pointService';
import type { PointFormValues } from '../schemas/point.schema';

export function useCreatePoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['points', 'create'],
    mutationFn: (input: PointFormValues) => pointService.createPoint(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points'] });
    },
  });
}

export default useCreatePoint;