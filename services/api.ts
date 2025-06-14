import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpcClient } from '@/lib/trpc';
import { supabase } from '@/lib/supabase';

// Base URL for the API
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.casamoc.com/v1';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Add a request interceptor to add the auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    // Get the token from storage
    const token = await AsyncStorage.getItem('auth_token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { token, refresh_token } = response.data;
          
          // Store the new tokens
          await AsyncStorage.setItem('auth_token', token);
          await AsyncStorage.setItem('refresh_token', refresh_token);
          
          // Update the Authorization header
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, log out the user
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user_data');
        
        // Redirect to login (this should be handled by the auth store)
        // We'll just reject the promise here
      }
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Erro de conexão. Verifique sua internet.';
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { data, status } = error.response;
    
    if (status === 400) {
      return data.message || 'Dados inválidos. Verifique e tente novamente.';
    }
    
    if (status === 401) {
      return 'Não autorizado. Faça login novamente.';
    }
    
    if (status === 403) {
      return 'Acesso negado. Você não tem permissão para esta ação.';
    }
    
    if (status === 404) {
      return 'Recurso não encontrado.';
    }
    
    if (status === 422) {
      // Validation errors
      if (data.errors) {
        const firstError = Object.values(data.errors)[0];
        return Array.isArray(firstError) ? firstError[0] : String(firstError);
      }
      return data.message || 'Erro de validação. Verifique os dados.';
    }
    
    if (status >= 500) {
      return 'Erro no servidor. Tente novamente mais tarde.';
    }
    
    return data.message || 'Ocorreu um erro. Tente novamente.';
  }
  
  if (error.request) {
    // The request was made but no response was received
    return 'Sem resposta do servidor. Verifique sua conexão.';
  }
  
  // Something happened in setting up the request that triggered an Error
  return error.message || 'Ocorreu um erro. Tente novamente.';
};

// Function to check if we should use Supabase
export const shouldUseSupabase = async (): Promise<boolean> => {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return false;
    }
    
    // Try to make a simple query to check if Supabase is available
    const { data } = await supabase.from('settings').select('*').limit(1);
    return true;
  } catch (error) {
    console.log('Supabase not available:', error);
    return false;
  }
};

// Function to check if we should use tRPC or fallback to mock data
export const shouldUseTRPC = async (): Promise<boolean> => {
  try {
    // First check if Supabase is available
    if (await shouldUseSupabase()) {
      return false; // Prefer Supabase over tRPC
    }
    
    // Try to make a simple tRPC request to check if the backend is available
    await trpcClient.auth.me.query();
    return true;
  } catch (error) {
    console.log('tRPC backend not available, falling back to mock data');
    return false;
  }
};