import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";

export const deletePropertyProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    try {
      // Check if the property exists and belongs to the current user
      const property = await ctx.prisma.property.findUnique({
        where: {
          id: input.id,
        },
      });
      
      if (!property) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Property not found',
        });
      }
      
      if (property.ownerId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this property',
        });
      }
      
      // Delete the property
      await ctx.prisma.property.delete({
        where: {
          id: input.id,
        },
      });
      
      return {
        success: true,
        message: 'Property deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting property:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete property',
      });
    }
  });