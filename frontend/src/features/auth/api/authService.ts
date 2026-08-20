import { getSupabaseClient } from '@/lib/supabase';
import type {
  LoginFormValues,
  RegisterFormValues,
} from '../schemas/auth.schema';

export type AuthRegisterInput = RegisterFormValues;
export type AuthLoginInput = LoginFormValues;

export async function registerWithEmail(input: AuthRegisterInput) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        role: input.role,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function loginWithEmail(input: AuthLoginInput) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getCurrentSession() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export const authService = {
  registerWithEmail,
  loginWithEmail,
  signOut,
  getCurrentSession,
};

export default authService;
