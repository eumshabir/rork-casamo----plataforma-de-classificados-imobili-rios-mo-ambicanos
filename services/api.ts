import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

// Check if Supabase is available and configured
export const shouldUseSupabase = async (): Promise<boolean> => {
  try {
    // Check if we have Supabase credentials
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
      return false;
    }
    
    // Try to ping Supabase
    const { data, error } = await supabase.from('settings').select('id').limit(1);
    
    // If we get a response (even if it's an empty array), Supabase is available
    return !error;
  } catch (error) {
    return false;
  }
};

// Check if tRPC is available
export const shouldUseTRPC = async (): Promise<boolean> => {
  try {
    // Check if we have API base URL
    if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
      return false;
    }
    
    // Try to ping the API
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Handle API errors
export const handleApiError = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  return 'An unexpected error occurred';
};