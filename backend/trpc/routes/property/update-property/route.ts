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
        province: z.string(),
        city: z.string(),
        neighborhood: z.string(),
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
          message: 'You do not have permission to update this property',
        });
      }
      
      // Update the property
      const updatedProperty = await ctx.prisma.property.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          description: input.description,
          price: input.price,
          currency: input.currency,
          type: input.type,
          listingType: input.listingType,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          area: input.area,
          location: input.location,
          amenities: input.amenities,
          images: input.images,
          featured: input.featured,
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
        ...updatedProperty,
        createdAt: updatedProperty.createdAt.toISOString(),
        updatedAt: updatedProperty.updatedAt.toISOString(),
        owner: {
          ...updatedProperty.owner,
          isPremium: updatedProperty.owner.role === 'premium',
        },
      };
    } catch (error) {
      console.error('Error updating property:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update property',
      });
    }
  });