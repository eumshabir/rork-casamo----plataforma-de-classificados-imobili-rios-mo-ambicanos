import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";

export const getUserByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    try {
      // Get user by ID
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          verified: true,
          createdAt: true,
          premiumUntil: true,
        },
      });
      
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      
      // Transform the data to match the expected format
      return {
        ...user,
        phone: user.phone || '',
        createdAt: user.createdAt.toISOString(),
        premiumUntil: user.premiumUntil ? user.premiumUntil.toISOString() : null,
        isPremium: user.role === 'premium',
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user',
      });
    }
  });