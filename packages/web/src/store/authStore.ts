import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, AuthState } from '@nxtai/shared';

interface AuthStore extends AuthState {
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      hasPermission: (permission) => {
        const { user } = get();
        if (!user?.customClaims?.permissions) return false;
        return user.customClaims.permissions.includes(permission);
      },

      hasRole: (roles) => {
        const { user } = get();
        if (!user?.customClaims?.role) return false;
        return roles.includes(user.customClaims.role);
      },
    }),
    {
      name: 'nxtai-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);