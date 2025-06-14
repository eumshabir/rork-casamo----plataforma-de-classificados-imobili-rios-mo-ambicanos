import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { PropertyFilter } from "@/types/property";

export const getPropertiesProcedure = publicProcedure
  .input(
    z.object({
      type: z.string().optional(),
      listingType: z.string().optional(),
      province: z.string().optional(),
      city: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      minBedrooms: z.number().optional(),
      minBathrooms: z.number().optional(),
      amenities: z.array(z.string()).optional(),
    }).optional()
  )
  .query(async ({ input, ctx }) => {
    try {
      // Build the query based on the filters
      const where: any = {};
      
      if (input?.type) {
        where.type = input.type;
      }
      
      if (input?.listingType) {
        where.listingType = input.listingType;
      }
      
      if (input?.province) {
        where.location = {
          ...where.location,
          province: input.province,
        };
      }
      
      if (input?.city) {
        where.location = {
          ...where.location,
          city: input.city,
        };
      }
      
      if (input?.minPrice) {
        where.price = {
          ...where.price,
          gte: input.minPrice,
        };
      }
      
      if (input?.maxPrice) {
        where.price = {
          ...where.price,
          lte: input.maxPrice,
        };
      }
      
      if (input?.minBedrooms) {
        where.bedrooms = {
          gte: input.minBedrooms,
        };
      }
      
      if (input?.minBathrooms) {
        where.bathrooms = {
          gte: input.minBathrooms,
        };
      }
      
      if (input?.amenities && input.amenities.length > 0) {
        where.amenities = {
          hasEvery: input.amenities,
        };
      }
      
      // Get properties from the database
      const properties = await ctx.db.property.findMany({
        where,
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
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // Transform the data to match the expected format
      return properties.map(property => ({
        ...property,
        owner: {
          ...property.owner,
          isPremium: property.owner.role === 'premium',
        },
      }));
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw new Error('Failed to fetch properties');
    }
  });