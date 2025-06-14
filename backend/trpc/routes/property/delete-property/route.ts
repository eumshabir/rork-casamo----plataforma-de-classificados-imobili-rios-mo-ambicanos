import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";

export const deletePropertyProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      // Check if the property exists and belongs to the current user
      const existingProperty = await ctx.db.property.findUnique({
        where: {
          id: input.id,
        },
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
          message: 'You do not have permission to delete this property',
        });
      }
      
      // Delete the property
      await ctx.db.property.delete({
        where: {
          id: input.id,
        },
      });
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting property:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new Error('Failed to delete property');
    }
  });