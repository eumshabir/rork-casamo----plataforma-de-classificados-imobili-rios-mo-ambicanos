import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getUsersProcedure = protectedProcedure
  .input(
    z.object({
      limit: z.number().int().min(1).max(100).default(10),
      offset: z.number().int().min(0).default(0),
      role: z.enum(['user', 'premium', 'admin']).optional(),
      isAdmin: z.boolean().default(true), // Require admin privileges
    }).optional()
  )
  .query(async ({ input, ctx }) => {
    // In a real app, we would check if the current user has admin privileges
    if (input && !input.isAdmin) {
      throw new Error("Unauthorized: Admin privileges required");
    }

    try {
      // Get users from AsyncStorage
      const storedUsers = await AsyncStorage.getItem('mock_users');
      let users = storedUsers ? JSON.parse(storedUsers) : [];

      // Apply filters if provided
      if (input?.role) {
        users = users.filter(user => user.role === input.role);
      }

      // Apply pagination
      const limit = input?.limit || 10;
      const offset = input?.offset || 0;
      const paginatedUsers = users.slice(offset, offset + limit);

      return {
        users: paginatedUsers,
        total: users.length,
        limit,
        offset,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error("Failed to fetch users");
    }
  });