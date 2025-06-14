import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/user';
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
  register: async (userData: { name: string; email: string; phone: string; password: string }): Promise<{ user: User; token: string }> => {
    try {
      const response = await trpcClient.auth.register.mutate(userData);
      
      // Store auth data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
      
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw new Error('Falha ao criar conta');
    }
  },
  
  // Logout
  logout: async (): Promise<void> => {
    try {
      // Remove local storage items
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Logout error:', error);
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
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  // Update user profile
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userData) {
        throw new Error('User not found');
      }
      
      const user = JSON.parse(userData);
      const updatedUser = { ...user, ...updates };
      
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Falha ao atualizar perfil');
    }
  },
};