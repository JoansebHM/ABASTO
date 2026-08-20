/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createElement } from 'react';
import { Role, VerificationStatus } from '../../src/lib/domain';
import { AuthForm } from '../../src/features/auth/components/AuthForm';
import type { RegisterFormValues } from '../../src/features/auth/schemas/auth.schema';

const signUp = vi.fn();
const signInWithPassword = vi.fn();
const signOut = vi.fn();
const getSession = vi.fn();
const maybeSingle = vi.fn();

vi.mock('../../src/lib/supabase', () => ({
  getSupabaseClient: () => ({
    auth: {
      signUp,
      signInWithPassword,
      signOut,
      getSession,
    },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle }),
      }),
    }),
  }),
}));

import { authService } from '../../src/features/auth/api/authService';
import { useAuthStore } from '../../src/features/auth/stores/useAuthStore';

afterEach(() => {
  cleanup();
});

const session = {
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  expires_in: 3600,
  expires_at: 1_800_000_000,
  token_type: 'bearer',
  user: {
    id: 'leader-1',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'leader@abasto.org',
  },
};

const pendingProfile = {
  id: 'leader-1',
  full_name: 'Ana Lider',
  role: Role.LeaderDisaster,
  verification_status: VerificationStatus.Pending,
  created_at: null,
  updated_at: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    session: null,
    user: null,
    profile: null,
    verificationStatus: null,
    permissions: {
      canCreatePoint: false,
      canAdjustInventory: false,
      canReviewVerification: false,
    },
    isLoading: false,
    isHydrated: false,
    error: null,
  });
});

describe('authentication and verification access flow', () => {
  it('registers a leader with a pending verification profile', async () => {
    signUp.mockResolvedValue({ data: { session }, error: null });
    getSession.mockResolvedValue({ data: { session }, error: null });
    maybeSingle.mockResolvedValue({ data: pendingProfile, error: null });

    const result = await authService.registerWithEmail({
      fullName: 'Ana Lider',
      email: 'leader@abasto.org',
      password: 'Password123',
      role: Role.LeaderDisaster,
    });

    expect(signUp).toHaveBeenCalledWith({
      email: 'leader@abasto.org',
      password: 'Password123',
      options: {
        data: { full_name: 'Ana Lider', role: Role.LeaderDisaster },
      },
    });

    useAuthStore.getState().setSession(result.session);
    await useAuthStore.getState().hydrate();

    expect(useAuthStore.getState().verificationStatus).toBe(
      VerificationStatus.Pending
    );
    expect(useAuthStore.getState().permissions.canCreatePoint).toBe(false);
    expect(useAuthStore.getState().permissions.canAdjustInventory).toBe(false);
  });

  it('hydrates an approved leader and enables operational writes after login', async () => {
    const approvedProfile = {
      ...pendingProfile,
      verification_status: VerificationStatus.Approved,
    };
    signInWithPassword.mockResolvedValue({ data: { session }, error: null });
    getSession.mockResolvedValue({ data: { session }, error: null });
    maybeSingle.mockResolvedValue({ data: approvedProfile, error: null });

    const result = await authService.loginWithEmail({
      email: 'leader@abasto.org',
      password: 'Password123',
    });

    useAuthStore.getState().setSession(result.session);
    await useAuthStore.getState().hydrate();

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'leader@abasto.org',
      password: 'Password123',
    });
    expect(useAuthStore.getState().verificationStatus).toBe(
      VerificationStatus.Approved
    );
    expect(useAuthStore.getState().permissions.canCreatePoint).toBe(true);
    expect(useAuthStore.getState().permissions.canAdjustInventory).toBe(true);
  });

  it('submits the registration form through authService', async () => {
    signUp.mockResolvedValue({ data: { session: null }, error: null });
    const onSubmit = vi.fn(async (values: RegisterFormValues) =>
      authService.registerWithEmail(values)
    );

    render(createElement(AuthForm, { mode: 'register', onSubmit }));
    fireEvent.change(screen.getByLabelText('Nombre completo'), {
      target: { value: 'Ana Lider' },
    });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'leader@abasto.org' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Password123' },
    });
    fireEvent.blur(screen.getByLabelText('Contraseña'));

    const submitButton = screen.getByRole('button', { name: 'Crear cuenta' });
    await waitFor(() =>
      expect((submitButton as HTMLButtonElement).disabled).toBe(false)
    );
    fireEvent.click(submitButton);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(signUp).toHaveBeenCalledWith({
      email: 'leader@abasto.org',
      password: 'Password123',
      options: {
        data: { full_name: 'Ana Lider', role: Role.LeaderDisaster },
      },
    });
  });

  it('submits the login form and clears the persisted session on logout', async () => {
    signInWithPassword.mockResolvedValue({ data: { session }, error: null });
    signOut.mockResolvedValue({ error: null });
    const onSubmit = vi.fn(async (values: { email: string; password: string }) =>
      authService.loginWithEmail(values)
    );

    render(createElement(AuthForm, { mode: 'login', onSubmit }));
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'leader@abasto.org' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Password123' },
    });
    fireEvent.blur(screen.getByLabelText('Contraseña'));

    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' });
    await waitFor(() =>
      expect((submitButton as HTMLButtonElement).disabled).toBe(false)
    );
    fireEvent.click(submitButton);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'leader@abasto.org',
      password: 'Password123',
    });

    useAuthStore.getState().setSession(session);
    await useAuthStore.getState().clear();

    expect(signOut).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().permissions.canCreatePoint).toBe(false);
  });
});