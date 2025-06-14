import { z } from "zod";
import { adminProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";

export const setPremiumProcedure = adminProcedure
  .input(
    z.object({
      userId: z.string(),
      duration: z.number().int().positive(), // Duration in days
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      // Check if the user exists
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
      });
      
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      
      // Calculate the premium expiration date
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + input.duration);
      
      // Update the user to premium
      const updatedUser = await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          role: 'premium',
          premiumUntil,
        },
      });
      
      return {
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone || '',
          role: updatedUser.role,
          verified: updatedUser.verified,
          createdAt: updatedUser.createdAt.toISOString(),
          premiumUntil: updatedUser.premiumUntil ? updatedUser.premiumUntil.toISOString() : null,
        },
      };
    } catch (error) {
      console.error('Error setting user as premium:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update user to premium status',
      });
    }
  });