import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

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
      const property = await ctx.db.property.create({
        data: {
          ...input,
          ownerId: ctx.userId,
          views: 0,
          createdAt: new Date(),
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
      console.error('Error creating property:', error);
      throw new Error('Failed to create property');
    }
  });