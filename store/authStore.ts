import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/user';
import { authService } from '@/services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  upgradeToPremium: (planDuration: number) => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authService.login(email, password);
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Falha ao fazer login' 
          });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authService.loginWithGoogle();
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Falha ao fazer login com Google' 
          });
          throw error;
        }
      },

      loginWithFacebook: async () => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authService.loginWithFacebook();
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Falha ao fazer login com Facebook' 
          });
          throw error;
        }
      },

      register: async (userData, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authService.register(userData, password);
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Falha ao criar conta' 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false,
            error: error instanceof Error ? error.message : 'Falha ao sair' 
          });
        }
      },

      updateUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await authService.updateProfile(userData);
          set({ 
            user: updatedUser,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false,
            error: error instanceof Error ? error.message : 'Falha ao atualizar perfil' 
          });
          throw error;
        }
      },

      upgradeToPremium: async (planDuration) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await authService.upgradeToPremium(planDuration);
          set({ 
            user: updatedUser,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false,
            error: error instanceof Error ? error.message : 'Falha ao atualizar para premium' 
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const isAuthenticated = await authService.isAuthenticated();
          if (isAuthenticated) {
            const user = await authService.getCurrentUser();
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            set({ 
              user: null, 
              token: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);