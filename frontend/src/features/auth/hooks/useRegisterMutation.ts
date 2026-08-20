import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api/authService';
import type { RegisterFormValues } from '../schemas/auth.schema';

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: async (input: RegisterFormValues) =>
      authService.registerWithEmail(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export default useRegisterMutation;
