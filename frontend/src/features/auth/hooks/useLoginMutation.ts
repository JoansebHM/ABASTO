import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api/authService';
import type { LoginFormValues } from '../schemas/auth.schema';

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: async (input: LoginFormValues) =>
      authService.loginWithEmail(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export default useLoginMutation;
