import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '@/types/user';
import { apiClient } from './api';
import { trpcClient } from '@/lib/trpc';

// Auth token storage key
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export const authService = {
  // Email & Password Login
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      const response = await trpcClient.auth.login.mutate({ email, password });
      
      // Store auth data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Credenciais inválidas');
    }
  },
  
  // Register new user
  register: async (userData: Partial<User>, password: string): Promise<{ user: User; token: string }> => {
    try {
      const response = await trpcClient.auth.register.mutate({ 
        ...userData, 
        password 
      });
      
      // Store auth data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw new Error('Falha ao criar conta');
    }
  },
  
  // Google OAuth login
  loginWithGoogle: async (): Promise<{ user: User; token: string }> => {
    try {
      const response = await trpcClient.auth.loginWithGoogle.mutate();
      
      // Store auth data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Falha ao fazer login com Google');
    }
  },
  
  // Facebook OAuth login
  loginWithFacebook: async (): Promise<{ user: User; token: string }> => {
    try {
      const response = await trpcClient.auth.loginWithFacebook.mutate();
      
      // Store auth data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      console.error('Facebook login error:', error);
      throw new Error('Falha ao fazer login com Facebook');
    }
  },
  
  // Logout
  logout: async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        await trpcClient.auth.logout.mutate();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove local storage items
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    }
  },
  
  // Check if user is logged in
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },
  
  // Get current user data
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await trpcClient.auth.me.query();
      
      // Update stored user data
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response));
      return response;
    } catch (error) {
      // Fallback to local storage
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    }
  },
  
  // Update user profile
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    try {
      const response = await trpcClient.user.updateProfile.mutate(updates);
      
      // Update stored user data
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response));
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Falha ao atualizar perfil');
    }
  },
  
  // Upgrade to premium
  upgradeToPremium: async (planDuration: number): Promise<User> => {
    try {
      const response = await trpcClient.user.upgradeToPremium.mutate({ planDuration });
      
      // Update stored user data
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response));
      return response;
    } catch (error) {
      console.error('Upgrade to premium error:', error);
      throw new Error('Falha ao atualizar para premium');
    }
  },
  
  // Verify phone number with SMS code
  verifyPhone: async (phone: string, code: string): Promise<boolean> => {
    try {
      const response = await trpcClient.auth.verifyPhone.mutate({ phone, code });
      return response.success;
    } catch (error) {
      console.error('Verify phone error:', error);
      throw new Error('Falha ao verificar telefone');
    }
  },
  
  // Request SMS verification code
  requestVerificationCode: async (phone: string): Promise<boolean> => {
    try {
      const response = await trpcClient.auth.requestVerificationCode.mutate({ phone });
      return response.success;
    } catch (error) {
      console.error('Request verification code error:', error);
      throw new Error('Falha ao solicitar código');
    }
  },
  
  // Reset password
  resetPassword: async (email: string): Promise<boolean> => {
    try {
      const response = await trpcClient.auth.resetPassword.mutate({ email });
      return response.success;
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error('Falha ao resetar senha');
    }
  }
};