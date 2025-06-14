import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getUserByIdProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
      isAdmin: z.boolean().default(false), // Admin check is optional for this endpoint
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      // Get users from AsyncStorage
      const storedUsers = await AsyncStorage.getItem('mock_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // Find the user by ID
      const user = users.find(user => user.id === input.userId);

      if (!user) {
        throw new Error("User not found");
      }

      // If not admin, remove sensitive information
      if (!input.isAdmin) {
        // Remove any sensitive fields here if needed
        // For example, we might want to hide some admin-only fields
        const { /* sensitive fields */ ...safeUser } = user;
        return safeUser;
      }

      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error("Failed to fetch user");
    }
  });