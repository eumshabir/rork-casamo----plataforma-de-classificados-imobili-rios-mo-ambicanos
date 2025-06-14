import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getPropertyByIdProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    const property = await ctx.prisma.property.findUnique({
      where: {
        id: input.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
            premiumUntil: true,
          },
        },
      },
    });
    
    if (!property) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Property not found',
      });
    }
    
    // Increment view count
    await ctx.prisma.property.update({
      where: { id: input.id },
      data: { views: { increment: 1 } },
    });
    
    // Transform the data to match the expected format
    return {
      ...property,
      views: property.views + 1,
      owner: {
        ...property.owner,
        isPremium: property.owner.premiumUntil ? new Date(property.owner.premiumUntil) > new Date() : false,
      },
    };
  });