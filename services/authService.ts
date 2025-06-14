import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '@/types/user';
import { handleApiError, shouldUseTRPC, shouldUseSupabase } from './api';
import { trpcClient } from '@/lib/trpc';
import { supabaseAuthService } from './supabaseService';

// Mock API endpoints
const MOCK_API_DELAY = 800;

// Mock user database
const MOCK_USERS = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '+258 84 123 4567',
    password: 'password123',
    role: 'user' as UserRole,
    verified: true,
    createdAt: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Maria Costa',
    email: 'maria@example.com',
    phone: '+258 82 987 6543',
    password: 'password123',
    role: 'premium' as UserRole,
    verified: true,
    premiumUntil: '2024-12-31T23:59:59Z',
    createdAt: '2023-02-20T14:45:00Z',
  }
];

// Auth token storage key
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export const authService = {
  // Email & Password Login
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        return await supabaseAuthService.login(email, password);
      }
      
      // Try to use tRPC if Supabase is not available
      if (await shouldUseTRPC()) {
        const result = await trpcClient.auth.login.mutate({ email, password });
        
        // Store auth data
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.token);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(result.user));
        
        return result;
      }
      
      // Fallback to mock if neither is available
      await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
      
      const user = MOCK_USERS.find(u => u.email === email);
      
      if (!user || user.password !== password) {
        throw new Error('Invalid credentials');
      }
      
      const { password: _, ...userWithoutPassword } = user;
      const token = `mock-token-${Date.now()}`;
      
      // Store auth data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userWithoutPassword));
      
      return { 
        user: userWithoutPassword as User, 
        token 
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Register new user
  register: async (userData: Partial<User>, password: string): Promise<{ user: User; token: string }> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        return await supabaseAuthService.register(userData, password);
      }
      
      // Try to use tRPC if Supabase is not available
      if (await shouldUseTRPC()) {
        const result = await trpcClient.auth.register.mutate({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone,
          password,
        });
        
        // Store auth data
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.token);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(result.user));
        
        return result;
      }
      
      // Fallback to mock if neither is available
      await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
      
      // Check if email already exists
      if (MOCK_USERS.some(u => u.email === userData.email)) {
        throw new Error('Email already in use');
      }
      
      // Create new user
      const newUser = {
        id: `${MOCK_USERS.length + 1}`,
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        password,
        role: 'user' as UserRole,
        verified: false,
        createdAt: new Date().toISOString(),
      };
      
      // In a real app, we would save this to a database
      MOCK_USERS.push(newUser);
      
      const { password: _, ...userWithoutPassword } = newUser;
      const token = `mock-token-${Date.now()}`;
      
      // Store auth data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userWithoutPassword));
      
      return { 
        user: userWithoutPassword as User, 
        token 
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Google OAuth login
  loginWithGoogle: async (): Promise<{ user: User; token: string }> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        return await supabaseAuthService.loginWithGoogle();
      }
      
      // In a real app, you would implement OAuth with Google
      // For now, we'll just use mock data
      await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
      
      // Mock Google auth response
      const googleUser = {
        id: 'google-123',
        name: 'Google User',
        email: 'google.user@example.com',
        phone: '',
        role: 'user' as UserRole,
        verified: true,
        createdAt: new Date().toISOString(),
      };
      
      const token = `google-token-${Date.now()}`;
      
      // Store auth data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(googleUser));
      
      return { user: googleUser, token };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Facebook OAuth login
  loginWithFacebook: async (): Promise<{ user: User; token: string }> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        return await supabaseAuthService.loginWithFacebook();
      }
      
      // In a real app, you would implement OAuth with Facebook
      // For now, we'll just use mock data
      await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
      
      // Mock Facebook auth response
      const facebookUser = {
        id: 'facebook-123',
        name: 'Facebook User',
        email: 'facebook.user@example.com',
        phone: '',
        role: 'user' as UserRole,
        verified: true,
        createdAt: new Date().toISOString(),
      };
      
      const token = `facebook-token-${Date.now()}`;
      
      // Store auth data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(facebookUser));
      
      return { user: facebookUser, token };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Logout
  logout: async (): Promise<void> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        await supabaseAuthService.logout();
        return;
      }
      
      // Remove local storage items
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Check if user is logged in
  isAuthenticated: async (): Promise<boolean> => {
    // Try to use Supabase first
    if (await shouldUseSupabase()) {
      return await supabaseAuthService.isAuthenticated();
    }
    
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },
  
  // Get current user data
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        return await supabaseAuthService.getCurrentUser();
      }
      
      // Try to use tRPC if Supabase is not available
      if (await shouldUseTRPC()) {
        const user = await trpcClient.auth.me.query();
        
        // Update stored user data
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        return user as User;
      }
      
      // Fallback to local storage
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      // If tRPC fails, try local storage
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    }
  },
  
  // Update user profile
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        return await supabaseAuthService.updateProfile(updates);
      }
      
      // Try to use tRPC if Supabase is not available
      if (await shouldUseTRPC()) {
        const updatedUser = await trpcClient.user.updateProfile.mutate(updates);
        
        // Update stored user data
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
        return updatedUser as User;
      }
      
      // Fallback to mock if neither is available
      await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
      
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userData) {
        throw new Error('User not authenticated');
      }
      
      const currentUser = JSON.parse(userData);
      const updatedUser = { ...currentUser, ...updates };
      
      // Update in mock database
      const userIndex = MOCK_USERS.findIndex(u => u.id === currentUser.id);
      if (userIndex >= 0) {
        MOCK_USERS[userIndex] = { 
          ...MOCK_USERS[userIndex], 
          ...updates,
          password: MOCK_USERS[userIndex].password // Keep the password
        };
      }
      
      // Update in storage
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Upgrade to premium
  upgradeToPremium: async (planDuration: number): Promise<User> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        // For now, we'll just simulate a successful upgrade
        const userData = await AsyncStorage.getItem(USER_DATA_KEY);
        if (!userData) {
          throw new Error('User not authenticated');
        }
        
        const currentUser = JSON.parse(userData);
        
        // Calculate premium expiration date
        const premiumUntil = new Date();
        premiumUntil.setDate(premiumUntil.getDate() + planDuration);
        
        const updatedUser = { 
          ...currentUser, 
          role: 'premium' as UserRole,
          premiumUntil: premiumUntil.toISOString()
        };
        
        // Update in storage
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
        
        return updatedUser;
      }
      
      // Try to use tRPC if Supabase is not available
      if (await shouldUseTRPC()) {
        const updatedUser = await trpcClient.payment.upgradeToPremium.mutate({
          planDuration
        });
        
        // Update stored user data
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
        return updatedUser as User;
      }
      
      // Fallback to mock if neither is available
      await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
      
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userData) {
        throw new Error('User not authenticated');
      }
      
      const currentUser = JSON.parse(userData);
      
      // Calculate premium expiration date
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + planDuration);
      
      const updatedUser = { 
        ...currentUser, 
        role: 'premium' as UserRole,
        premiumUntil: premiumUntil.toISOString()
      };
      
      // Update in mock database
      const userIndex = MOCK_USERS.findIndex(u => u.id === currentUser.id);
      if (userIndex >= 0) {
        MOCK_USERS[userIndex] = { 
          ...MOCK_USERS[userIndex], 
          role: 'premium' as UserRole,
          premiumUntil: premiumUntil.toISOString()
        };
      }
      
      // Update in storage
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Verify phone number with SMS code
  verifyPhone: async (phone: string, code: string): Promise<boolean> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        return await supabaseAuthService.verifyPhone(phone, code);
      }
      
      // Try to use tRPC if Supabase is not available
      if (await shouldUseTRPC()) {
        const result = await trpcClient.auth.verifyPhone.mutate({ phone, code });
        return result.success;
      }
      
      // Fallback to mock if neither is available
      await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
      
      // Mock verification (always succeeds with code "123456")
      return code === "123456";
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Request SMS verification code
  requestVerificationCode: async (phone: string): Promise<boolean> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        return await supabaseAuthService.requestVerificationCode(phone);
      }
      
      // Try to use tRPC if Supabase is not available
      if (await shouldUseTRPC()) {
        const result = await trpcClient.auth.requestVerificationCode.mutate({ phone });
        return result.success;
      }
      
      // Fallback to mock if neither is available
      await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
      
      // Mock request (always succeeds)
      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Reset password
  resetPassword: async (email: string): Promise<boolean> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        return await supabaseAuthService.resetPassword(email);
      }
      
      // Try to use tRPC if Supabase is not available
      if (await shouldUseTRPC()) {
        const result = await trpcClient.auth.resetPassword.mutate({ email });
        return result.success;
      }
      
      // Fallback to mock if neither is available
      await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
      
      // Check if email exists
      const userExists = MOCK_USERS.some(u => u.email === email);
      if (!userExists) {
        throw new Error('Email not found');
      }
      
      // Mock reset (always succeeds if email exists)
      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        return await supabaseAuthService.changePassword(currentPassword, newPassword);
      }
      
      // Try to use tRPC if Supabase is not available
      if (await shouldUseTRPC()) {
        const result = await trpcClient.user.changePassword.mutate({
          currentPassword,
          newPassword,
        });
        return result.success;
      }
      
      // Fallback to mock if neither is available
      await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
      
      // Get current user
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userData) {
        throw new Error('User not authenticated');
      }
      
      const currentUser = JSON.parse(userData);
      
      // Find user in mock database
      const userIndex = MOCK_USERS.findIndex(u => u.id === currentUser.id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Check current password
      if (MOCK_USERS[userIndex].password !== currentPassword) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password
      MOCK_USERS[userIndex].password = newPassword;
      
      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};