/**
 * @file Auth store
 * @description Zustand store for authentication state
 * @module stores/auth.store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user.types';
import { authService } from '@/services/auth.service';
import { setAuthCallbacks } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email: string, password: string) => {
        const response = await authService.login(email, password);
        set({ user: response.user, token: response.token });
      },
      register: async (name: string, email: string, password: string) => {
        const response = await authService.register(name, email, password);
        set({ user: response.user, token: response.token });
      },
      logout: () => {
        authService.logout();
        set({ user: null, token: null });
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ token: s.token }) },
  ),
);

setAuthCallbacks(
  () => useAuthStore.getState().token,
  () => useAuthStore.setState({ user: null, token: null }),
);
