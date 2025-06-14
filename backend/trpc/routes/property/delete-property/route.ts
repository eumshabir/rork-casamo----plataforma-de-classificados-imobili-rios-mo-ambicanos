import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const deletePropertyProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Check if property exists and user owns it
    const existingProperty = await ctx.prisma.property.findUnique({
      where: { id: input.id },
    });
    
    if (!existingProperty) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Property not found',
      });
    }
    
    if (existingProperty.ownerId !== ctx.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You can only delete your own properties',
      });
    }
    
    await ctx.prisma.property.delete({
      where: { id: input.id },
    });
    
    return {
      success: true,
      message: 'Property deleted successfully',
    };
  });