import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://yrlocxrtmrjkcrolamoj.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlybG9jeHJ0bXJqa2Nyb2xhbW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjEwNzEsImV4cCI6MjA2NTQ5NzA3MX0.1mpSZAvNb5MtGwHFZEg31kYsfkRZaRYmdg1bAeqTsrI';

export const supabase = createClient(supabaseUrl, supabaseKey, {
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
    // Sign in with email and password
    signInWithPassword: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return {
        session: data.session,
        user: data.user,
      };
    },
    
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
        session: data.session,
        user: data.user,
      };
    },
    
    // Sign in with OAuth provider
    signInWithOAuth: async (provider: 'google' | 'facebook') => {
      return await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'yourapp://auth/callback',
        },
      });
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