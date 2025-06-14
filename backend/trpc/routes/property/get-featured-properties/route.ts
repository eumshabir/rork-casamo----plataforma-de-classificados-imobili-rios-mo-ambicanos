import { publicProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";

export const getFeaturedPropertiesProcedure = publicProcedure
  .query(async ({ ctx }) => {
    try {
      // Get featured properties from the in-memory database
      const properties = Array.from(ctx.db.properties.values())
        .filter((property: any) => property.featured === true);
      
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
      console.error('Error fetching featured properties:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch featured properties',
      });
    }
  });