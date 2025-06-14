import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { adminProcedure } from '@/backend/trpc/create-context';

export const setPremiumProcedure = adminProcedure
  .input(z.object({
    userId: z.string(),
    premiumUntil: z.string().datetime().nullable(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { userId, premiumUntil } = input;
    
    // Check if user exists
    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }
    
    // Update user premium status
    const updatedUser = await ctx.prisma.user.update({
      where: { id: userId },
      data: {
        premiumUntil: premiumUntil ? new Date(premiumUntil) : null,
      },
    });
    
    // Return user data without password hash
    const { passwordHash, ...userWithoutPassword } = updatedUser;
    
    return userWithoutPassword;
  });