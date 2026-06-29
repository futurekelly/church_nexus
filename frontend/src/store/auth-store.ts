import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, AuthTokens, User } from "@/types/user";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (session: AuthSession) => void;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
}

const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isHydrated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (session) =>
        set({
          user: session.user,
          tokens: session.tokens,
          isAuthenticated: true,
        }),
      setTokens: (tokens) => set({ tokens }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ ...initialState, isHydrated: true }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: "church-auth-storage",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function getAccessToken(): string | null {
  return useAuthStore.getState().tokens?.access_token ?? null;
}
