import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

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

    try {
      // Update user role to premium in the database
      // This would be a database call in a real app
      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: {
          role: 'premium',
          premiumUntil: new Date(Date.now() + input.duration * 24 * 60 * 60 * 1000),
        },
      });

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      console.error('Error setting user as premium:', error);
      throw new Error('Failed to update user to premium status');
    }
  });