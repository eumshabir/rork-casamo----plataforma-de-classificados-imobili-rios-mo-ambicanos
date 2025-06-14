import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const createPropertyProcedure = protectedProcedure
  .input(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    price: z.number().positive(),
    currency: z.string().default('MZN'),
    type: z.string(),
    listingType: z.string(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    area: z.number().positive(),
    location: z.object({
      province: z.string(),
      city: z.string(),
      neighborhood: z.string(),
      address: z.string().optional(),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }).optional(),
    }),
    amenities: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }))
  .mutation(async ({ input, ctx }) => {
    const property = await ctx.prisma.property.create({
      data: {
        ...input,
        ownerId: ctx.userId,
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
    
    // Transform the data to match the expected format
    return {
      ...property,
      owner: {
        ...property.owner,
        isPremium: property.owner.premiumUntil ? new Date(property.owner.premiumUntil) > new Date() : false,
      },
    };
  });