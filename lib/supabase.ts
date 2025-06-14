import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for common operations
export const supabaseHelper = {
  // Auth helpers
  auth: {
    signUp: async (email: string, password: string, userData: any) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      if (error) throw error;
      return data;
    },

    signInWithPassword: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },

    signInWithOAuth: async (provider: 'google' | 'facebook') => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
      });
      if (error) throw error;
      return data;
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    getCurrentUser: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },

    getSession: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
  },

  // Database helpers
  db: {
    // Properties
    getProperties: async (filters?: any) => {
      let query = supabase.from('properties').select('*, images(*)');

      // Apply filters if provided
      if (filters) {
        if (filters.type) query = query.eq('type', filters.type);
        if (filters.listingType) query = query.eq('listingType', filters.listingType);
        if (filters.province) query = query.eq('province', filters.province);
        if (filters.city) query = query.eq('city', filters.city);
        if (filters.minPrice) query = query.gte('price', filters.minPrice);
        if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
        if (filters.minBedrooms) query = query.gte('bedrooms', filters.minBedrooms);
        if (filters.minBathrooms) query = query.gte('bathrooms', filters.minBathrooms);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    getFeaturedProperties: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, images(*)')
        .eq('featured', true);
      if (error) throw error;
      return data;
    },

    getUserProperties: async (userId: string) => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, images(*)')
        .eq('userId', userId);
      if (error) throw error;
      return data;
    },

    getProperty: async (id: string) => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, images(*), amenities(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    createProperty: async (propertyData: any) => {
      const { data, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    updateProperty: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    deleteProperty: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },

    // Favorites
    addToFavorites: async (userId: string, propertyId: string) => {
      const { error } = await supabase
        .from('favorites')
        .insert({ userId, propertyId });
      if (error) throw error;
      return { success: true };
    },

    removeFromFavorites: async (userId: string, propertyId: string) => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ userId, propertyId });
      if (error) throw error;
      return { success: true };
    },

    getFavorites: async (userId: string) => {
      const { data, error } = await supabase
        .from('favorites')
        .select('property:propertyId(*)')
        .eq('userId', userId);
      if (error) throw error;
      return data.map((fav: any) => fav.property);
    },

    // User profile
    updateUserProfile: async (userId: string, updates: any) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // Storage helpers
    uploadPropertyImage: async (file: any, path: string) => {
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(path, file);
      if (error) throw error;
      return data;
    },

    getImageUrl: (path: string) => {
      return supabase.storage.from('property-images').getPublicUrl(path).data.publicUrl;
    },
  },
};