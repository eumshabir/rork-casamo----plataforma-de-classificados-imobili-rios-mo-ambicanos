import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/user";

// Mock users database for backend
let MOCK_USERS = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '+258 84 123 4567',
    role: 'user',
    verified: true,
    createdAt: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Maria Costa',
    email: 'maria@example.com',
    phone: '+258 82 987 6543',
    role: 'premium',
    verified: true,
    premiumUntil: '2024-12-31T23:59:59Z',
    createdAt: '2023-02-20T14:45:00Z',
  }
];

// Initialize mock users from AsyncStorage if available
const initMockUsers = async () => {
  try {
    const storedUsers = await AsyncStorage.getItem('mock_users');
    if (storedUsers) {
      MOCK_USERS = JSON.parse(storedUsers);
    } else {
      await AsyncStorage.setItem('mock_users', JSON.stringify(MOCK_USERS));
    }
  } catch (error) {
    console.error('Error initializing mock users:', error);
  }
};

// Initialize on module load
initMockUsers();

export const setPremiumProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
      duration: z.number().int().positive(),
      isAdmin: z.boolean().default(true), // Require admin privileges
    })
  )
  .mutation(async ({ input, ctx }) => {
    // In a real app, we would check if the current user has admin privileges
    if (!input.isAdmin) {
      throw new Error("Unauthorized: Admin privileges required");
    }

    // Find the user in our mock database
    const userIndex = MOCK_USERS.findIndex(user => user.id === input.userId);
    
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    // Calculate premium expiration date
    const premiumUntil = new Date();
    premiumUntil.setDate(premiumUntil.getDate() + input.duration);

    // Update the user
    MOCK_USERS[userIndex] = {
      ...MOCK_USERS[userIndex],
      role: 'premium',
      premiumUntil: premiumUntil.toISOString(),
    };

    // Save updated users to AsyncStorage
    try {
      await AsyncStorage.setItem('mock_users', JSON.stringify(MOCK_USERS));
    } catch (error) {
      console.error('Error saving mock users:', error);
    }

    // Return the updated user
    return {
      success: true,
      user: MOCK_USERS[userIndex],
    };
  });