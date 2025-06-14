import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getUserByIdProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        verified: true,
        premiumUntil: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }
    
    return user;
  });