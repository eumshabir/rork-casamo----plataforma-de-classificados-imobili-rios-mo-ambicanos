import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://yrlocxrtmrjkcrolamoj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlybG9jeHJ0bXJqa2Nyb2xhbW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjEwNzEsImV4cCI6MjA2NTQ5NzA3MX0.1mpSZAvNb5MtGwHFZEg31kYsfkRZaRYmdg1bAeqTsrI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for common Supabase operations
export const supabaseHelper = {
  auth: {
    // Sign up with email and password
    signUp: async (email: string, password: string, metadata?: any) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata
          }
        });
        
        if (error) throw error;
        
        return {
          user: data.user,
          session: data.session
        };
      } catch (error) {
        console.error('Error signing up:', error);
        throw error;
      }
    },
    
    // Sign in with email and password
    signInWithPassword: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        return {
          user: data.user,
          session: data.session
        };
      } catch (error) {
        console.error('Error signing in:', error);
        throw error;
      }
    },
    
    // Sign in with OAuth provider
    signInWithOAuth: async (provider: 'google' | 'facebook' | 'apple') => {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: 'casamoc://auth/callback'
          }
        });
        
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error(`Error signing in with ${provider}:`, error);
        throw error;
      }
    },
    
    // Sign out
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    },
    
    // Get current session
    getSession: async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
      } catch (error) {
        console.error('Error getting session:', error);
        return null;
      }
    },
    
    // Get current user
    getCurrentUser: async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data.user;
      } catch (error) {
        console.error('Error getting current user:', error);
        return null;
      }
    },
  },
  
  // Storage helpers
  storage: {
    // Upload file
    uploadFile: async (bucket: string, path: string, file: any) => {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(path, file);
        
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    },
    
    // Get public URL
    getPublicUrl: (bucket: string, path: string) => {
      return supabase.storage.from(bucket).getPublicUrl(path);
    },
    
    // Delete file
    deleteFile: async (bucket: string, path: string) => {
      try {
        const { error } = await supabase.storage
          .from(bucket)
          .remove([path]);
        
        if (error) throw error;
        
        return true;
      } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
      }
    },
  },
};