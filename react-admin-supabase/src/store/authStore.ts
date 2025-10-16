import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SimpleUser {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  level: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: SimpleUser | null;
  token: string | null;
  sessionTime: number | null;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  setUser: (user: SimpleUser) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: SimpleUser, token: string) => void;
  logout: () => void;
  clearError: () => void;
  updateSessionTime: () => void;
  isSessionValid: () => boolean;
  isTokenValid: () => boolean;
}

type AuthStore = AuthState & AuthActions;

// Session duration: 24 hours in milliseconds
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      sessionTime: null,
      loading: false,
      error: null,

      // Actions
      setUser: (user: SimpleUser) => {
        set({
          user,
          isAuthenticated: true,
          error: null
        });
      },

      setToken: (token: string) => {
        set({ token });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error, loading: false });
      },

      login: (user: SimpleUser, token: string) => {
        const now = Date.now();
        set({
          user,
          token,
          isAuthenticated: true,
          sessionTime: now,
          loading: false,
          error: null
        });
        console.log('🎉 [AUTH_STORE] User logged in with JWT:', user.email);
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          sessionTime: null,
          loading: false,
          error: null
        });
        console.log('🚪 [AUTH_STORE] User logged out');
      },

      clearError: () => {
        set({ error: null });
      },

      updateSessionTime: () => {
        const now = Date.now();
        set({ sessionTime: now });
        console.log('🔄 [AUTH_STORE] Session time updated');
      },

      isSessionValid: () => {
        const { sessionTime } = get();
        if (!sessionTime) return false;
        
        const now = Date.now();
        const isValid = now - sessionTime < SESSION_DURATION;
        
        if (!isValid) {
          console.log('⏰ [AUTH_STORE] Session expired, auto logout');
          get().logout();
        }
        
        return isValid;
      },

      isTokenValid: () => {
        const { token } = get();
        if (!token) return false;
        
        // Import JWT functions dynamically to avoid circular dependency
        try {
          const parts = token.split('.');
          if (parts.length !== 3) return false;
          
          const payload = JSON.parse(atob(parts[1]));
          const now = Math.floor(Date.now() / 1000);
          
          return payload.exp > now;
        } catch (error) {
          console.log('❌ [AUTH_STORE] Invalid JWT token format');
          return false;
        }
      }
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        sessionTime: state.sessionTime
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('📱 [AUTH_STORE] Rehydrated from storage');
          
          // Check if session and token are still valid after rehydration
          if (state.isAuthenticated && state.sessionTime && state.token) {
            const now = Date.now();
            const sessionValid = now - state.sessionTime < SESSION_DURATION;
            const tokenValid = state.isTokenValid();
            
            if (!sessionValid || !tokenValid) {
              console.log('⏰ [AUTH_STORE] Stored session or token expired, clearing');
              state.logout();
            } else {
              console.log('✅ [AUTH_STORE] Stored session and token are valid');
            }
          }
        }
      }
    }
  )
);

// Helper functions
export const getAuthState = (): AuthState => {
  const store = useAuthStore.getState();
  return {
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    token: store.token,
    sessionTime: store.sessionTime,
    loading: store.loading,
    error: store.error
  };
};

export const setAuthLoading = (loading: boolean): void => {
  useAuthStore.getState().setLoading(loading);
};

export const setAuthError = (error: string | null): void => {
  useAuthStore.getState().setError(error);
};

export const loginUser = (user: SimpleUser, token: string): void => {
  useAuthStore.getState().login(user, token);
};

export const logoutUser = (): void => {
  useAuthStore.getState().logout();
};

export const isSessionValid = (): boolean => {
  return useAuthStore.getState().isSessionValid();
};

export const isTokenValid = (): boolean => {
  return useAuthStore.getState().isTokenValid();
};
