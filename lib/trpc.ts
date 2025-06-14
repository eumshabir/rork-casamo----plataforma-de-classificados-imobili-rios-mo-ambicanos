import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import superjson from 'superjson';
import type { AppRouter } from '@/backend/trpc/app-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create React Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Get the API URL from environment variables or use a default
const getBaseUrl = () => {
  // For development, use the local server
  if (__DEV__) {
    const localhost = Constants.expoConfig?.hostUri?.split(':')[0];
    if (localhost) {
      return `http://${localhost}:3000/api`;
    }
  }
  
  // For production, use the deployed API
  return process.env.EXPO_PUBLIC_API_URL || 'https://your-production-api.com/api';
};

// Create the tRPC client
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      async headers() {
        const token = await AsyncStorage.getItem('auth_token');
        return {
          Authorization: token ? `Bearer ${token}` : '',
        };
      },
    }),
  ],
  transformer: superjson,
});

// Create the tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();