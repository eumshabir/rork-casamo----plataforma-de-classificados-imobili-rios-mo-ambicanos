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
      // Get all properties from the in-memory database
      let properties = Array.from(ctx.db.properties.values());
      
      // Apply filters if provided
      if (input) {
        if (input.type) {
          properties = properties.filter((property: any) => property.type === input.type);
        }
        
        if (input.listingType) {
          properties = properties.filter((property: any) => property.listingType === input.listingType);
        }
        
        if (input.province) {
          properties = properties.filter((property: any) => 
            property.location && property.location.province === input.province
          );
        }
        
        if (input.city) {
          properties = properties.filter((property: any) => 
            property.location && property.location.city === input.city
          );
        }
        
        if (input.minPrice) {
          properties = properties.filter((property: any) => property.price >= input.minPrice);
        }
        
        if (input.maxPrice) {
          properties = properties.filter((property: any) => property.price <= input.maxPrice);
        }
        
        if (input.minBedrooms) {
          properties = properties.filter((property: any) => 
            property.bedrooms && property.bedrooms >= input.minBedrooms
          );
        }
        
        if (input.minBathrooms) {
          properties = properties.filter((property: any) => 
            property.bathrooms && property.bathrooms >= input.minBathrooms
          );
        }
        
        if (input.amenities && input.amenities.length > 0) {
          properties = properties.filter((property: any) => 
            property.amenities && input.amenities?.every(amenity => 
              property.amenities.includes(amenity)
            )
          );
        }
      }
      
      // Sort by creation date (newest first)
      properties.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Transform the data to match the expected format
      return properties.map((property: any) => {
        const owner = ctx.db.users.get(property.ownerId);
        
        return {
          ...property,
          owner: owner ? {
            id: owner.id,
            name: owner.name,
            phone: owner.phone,
            role: owner.role,
            isPremium: owner.role === 'premium',
          } : null,
        };
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch properties',
      });
    }
  });