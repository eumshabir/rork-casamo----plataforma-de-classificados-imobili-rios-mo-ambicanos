import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";

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
      // Build the filter object based on the input
      const filter: any = {};
      
      if (input) {
        if (input.type) {
          filter.type = input.type;
        }
        
        if (input.listingType) {
          filter.listingType = input.listingType;
        }
        
        if (input.province) {
          filter.location = {
            path: '$.province',
            equals: input.province,
          };
        }
        
        if (input.city && !input.province) {
          filter.location = {
            path: '$.city',
            equals: input.city,
          };
        }
        
        if (input.minPrice || input.maxPrice) {
          filter.price = {};
          
          if (input.minPrice) {
            filter.price.gte = input.minPrice;
          }
          
          if (input.maxPrice) {
            filter.price.lte = input.maxPrice;
          }
        }
        
        if (input.minBedrooms) {
          filter.bedrooms = {
            gte: input.minBedrooms,
          };
        }
        
        if (input.minBathrooms) {
          filter.bathrooms = {
            gte: input.minBathrooms,
          };
        }
        
        // Amenities filtering is more complex with Prisma
        // This is a simplified version
        if (input.amenities && input.amenities.length > 0) {
          filter.amenities = {
            hasEvery: input.amenities,
          };
        }
      }
      
      // Get properties from the database with filters
      const properties = await ctx.prisma.property.findMany({
        where: filter,
        orderBy: {
          createdAt: 'desc',
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
      return properties.map((property) => ({
        ...property,
        createdAt: property.createdAt.toISOString(),
        updatedAt: property.updatedAt.toISOString(),
        owner: {
          ...property.owner,
          isPremium: property.owner.role === 'premium',
        },
      }));
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch properties',
      });
    }
  });