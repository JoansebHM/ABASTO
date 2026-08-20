import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { getSupabaseClient } from '../lib/supabase';

export function Providers({ children }: { children: React.ReactNode }) {
  // initialize supabase client for side-effects
  try {
    getSupabaseClient();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
  }

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default Providers;
