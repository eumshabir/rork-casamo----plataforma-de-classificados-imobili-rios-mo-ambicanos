import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";

export const updatePropertyProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      price: z.number().optional(),
      currency: z.string().optional(),
      type: z.string().optional(),
      listingType: z.string().optional(),
      bedrooms: z.number().optional(),
      bathrooms: z.number().optional(),
      area: z.number().optional(),
      location: z.object({
        province: z.string().optional(),
        city: z.string().optional(),
        neighborhood: z.string().optional(),
        address: z.string().optional(),
        coordinates: z.object({
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        }).optional(),
      }).optional(),
      amenities: z.array(z.string()).optional(),
      images: z.array(z.string()).optional(),
      featured: z.boolean().optional(),
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
          message: 'You do not have permission to update this property',
        });
      }
      
      // Update the property
      const property = await ctx.db.property.update({
        where: {
          id: input.id,
        },
        data: {
          ...input,
          id: undefined, // Remove id from the update data
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
      
      // Transform the data to match the expected format
      return {
        ...property,
        owner: {
          ...property.owner,
          isPremium: property.owner.role === 'premium',
        },
      };
    } catch (error) {
      console.error('Error updating property:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new Error('Failed to update property');
    }
  });