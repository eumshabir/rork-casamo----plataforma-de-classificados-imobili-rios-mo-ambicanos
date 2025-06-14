import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for Supabase auth
export const supabaseHelper = {
  auth: {
    // Sign up with email and password
    signUp: async (email: string, password: string, metadata?: any) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) throw error;
      
      return {
        user: data.user,
        session: data.session,
      };
    },
    
    // Sign in with email and password
    signInWithPassword: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return {
        user: data.user,
        session: data.session,
      };
    },
    
    // Sign in with OAuth provider
    signInWithOAuth: async (provider: 'google' | 'facebook' | 'apple') => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
      });
      
      if (error) throw error;
      
      return data;
    },
    
    // Sign out
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    
    // Get current session
    getSession: async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      return data.session;
    },
    
    // Get current user
    getCurrentUser: async () => {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      return data.user;
    },
  },
};