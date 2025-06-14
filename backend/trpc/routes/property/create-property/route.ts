import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";

export const createPropertyProcedure = protectedProcedure
  .input(
    z.object({
      title: z.string(),
      description: z.string(),
      price: z.number(),
      currency: z.string(),
      type: z.string(),
      listingType: z.string(),
      bedrooms: z.number().optional(),
      bathrooms: z.number().optional(),
      area: z.number(),
      location: z.object({
        province: z.string(),
        city: z.string(),
        neighborhood: z.string(),
        address: z.string().optional(),
        coordinates: z.object({
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        }).optional(),
      }),
      amenities: z.array(z.string()),
      images: z.array(z.string()),
      featured: z.boolean().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      // Create a new property
      const property = await ctx.prisma.property.create({
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
          featured: input.featured || false,
          views: 0,
          owner: {
            connect: {
              id: ctx.userId,
            },
          },
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
        createdAt: property.createdAt.toISOString(),
        updatedAt: property.updatedAt.toISOString(),
        owner: {
          ...property.owner,
          isPremium: property.owner.role === 'premium',
        },
      };
    } catch (error) {
      console.error('Error creating property:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create property',
      });
    }
  });