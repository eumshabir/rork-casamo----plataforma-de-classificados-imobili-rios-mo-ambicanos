import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getPropertiesProcedure = publicProcedure
  .input(z.object({
    type: z.string().optional(),
    listingType: z.string().optional(),
    province: z.string().optional(),
    city: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    minBedrooms: z.number().optional(),
    minBathrooms: z.number().optional(),
    amenities: z.array(z.string()).optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }).optional())
  .query(async ({ input, ctx }) => {
    const filters = input || {};
    
    // Build where clause
    const where: any = {};
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.listingType) {
      where.listingType = filters.listingType;
    }
    
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }
    
    if (filters.minBedrooms) {
      where.bedrooms = { gte: filters.minBedrooms };
    }
    
    if (filters.minBathrooms) {
      where.bathrooms = { gte: filters.minBathrooms };
    }
    
    if (filters.amenities && filters.amenities.length > 0) {
      where.amenities = {
        hasEvery: filters.amenities,
      };
    }
    
    // Location filters (stored as JSON)
    if (filters.province || filters.city) {
      where.location = {};
      if (filters.province) {
        where.location.path = ['province'];
        where.location.equals = filters.province;
      }
      if (filters.city) {
        where.location.path = ['city'];
        where.location.equals = filters.city;
      }
    }
    
    const properties = await ctx.prisma.property.findMany({
      where,
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
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: filters.limit,
      skip: filters.offset,
    });
    
    // Transform the data to match the expected format
    return properties.map((property) => ({
      ...property,
      owner: {
        ...property.owner,
        isPremium: property.owner.premiumUntil ? new Date(property.owner.premiumUntil) > new Date() : false,
      },
    }));
  });