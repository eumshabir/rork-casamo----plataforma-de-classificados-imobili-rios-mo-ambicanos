import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export const getPropertyByIdProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      // Get property by ID
      const property = await ctx.db.property.findUnique({
        where: {
          id: input.id,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              phone: true,
              role: true,
            },
          },
        },
      });
      
      if (!property) {
        throw new Error('Property not found');
      }
      
      // Increment view count
      await ctx.db.property.update({
        where: {
          id: input.id,
        },
        data: {
          views: {
            increment: 1,
          },
        },
      });
      
      // Transform the data to match the expected format
      return {
        ...property,
        owner: {
          ...property.owner,
          isPremium: property.owner.role === 'premium',
        },
      };
    } catch (error) {
      console.error('Error fetching property:', error);
      throw new Error('Failed to fetch property');
    }
  });