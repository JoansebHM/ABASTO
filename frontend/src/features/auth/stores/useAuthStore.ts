import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, User } from '@supabase/supabase-js';
import type { UserProfile } from '@/lib/database.types';
import { canAdjustInventory, canCreatePoint, isAdmin } from '@/lib/guards';
import { authService } from '../api/authService';

export interface AuthPermissions {
  canCreatePoint: boolean;
  canAdjustInventory: boolean;
  canReviewVerification: boolean;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  verificationStatus: UserProfile['verification_status'] | null;
  permissions: AuthPermissions;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  setSession: (session: Session | null) => void;
  hydrate: () => Promise<void>;
  clear: () => Promise<void>;
}

const emptyPermissions: AuthPermissions = {
  canCreatePoint: false,
  canAdjustInventory: false,
  canReviewVerification: false,
};

function getPermissions(profile: UserProfile | null): AuthPermissions {
  if (!profile) return emptyPermissions;

  return {
    canCreatePoint: canCreatePoint(
      profile.role,
      profile.verification_status
    ),
    canAdjustInventory: canAdjustInventory(
      profile.role,
      profile.verification_status
    ),
    canReviewVerification: isAdmin(profile.role),
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'No se pudo cargar la sesión.';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      profile: null,
      verificationStatus: null,
      permissions: emptyPermissions,
      isLoading: false,
      isHydrated: false,
      error: null,

      setSession: (session) =>
        set({
          session,
          user: session?.user ?? null,
          error: null,
        }),

      hydrate: async () => {
        set({ isLoading: true, error: null });

        try {
          const session = await authService.getCurrentSession();
          if (!session) {
            set({
              session: null,
              user: null,
              profile: null,
              verificationStatus: null,
              permissions: emptyPermissions,
              isLoading: false,
              isHydrated: true,
            });
            return;
          }

          const profile = await authService.getUserProfile(session.user.id);
          set({
            session,
            user: session.user,
            profile,
            verificationStatus: profile?.verification_status ?? null,
            permissions: getPermissions(profile),
            isLoading: false,
            isHydrated: true,
          });
        } catch (error) {
          set({ isLoading: false, isHydrated: true, error: getErrorMessage(error) });
          throw error;
        }
      },

      clear: async () => {
        set({ isLoading: true, error: null });
        try {
          await authService.signOut();
          set({
            session: null,
            user: null,
            profile: null,
            verificationStatus: null,
            permissions: emptyPermissions,
            isLoading: false,
            isHydrated: true,
          });
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) });
          throw error;
        }
      },
    }),
    {
      name: 'abasto-auth',
      partialize: (state) => ({
        session: state.session,
        user: state.user,
        profile: state.profile,
        verificationStatus: state.verificationStatus,
        permissions: state.permissions,
      }),
    }
  )
);

export default useAuthStore;