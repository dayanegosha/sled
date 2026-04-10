import { create } from 'zustand';

export type AuthUser = {
  id?: string;
  sub?: string;
  display_name?: string;
  username?: string;
  avatar_url?: string | null;
  bio?: string | null;
  is_admin?: boolean;
  needs_username?: boolean;
  vk_id?: string | number | null;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ user: null, loading: false }),
}));
