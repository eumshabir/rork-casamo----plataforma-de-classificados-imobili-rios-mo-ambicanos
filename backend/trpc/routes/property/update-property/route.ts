import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const updatePropertyProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    currency: z.string().optional(),
    type: z.string().optional(),
    listingType: z.string().optional(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    area: z.number().positive().optional(),
    location: z.object({
      province: z.string(),
      city: z.string(),
      neighborhood: z.string(),
      address: z.string().optional(),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }).optional(),
    }).optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { id, ...updateData } = input;
    
    // Check if property exists and user owns it
    const existingProperty = await ctx.prisma.property.findUnique({
      where: { id },
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
        message: 'You can only update your own properties',
      });
    }
    
    const property = await ctx.prisma.property.update({
      where: { id },
      data: updateData,
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