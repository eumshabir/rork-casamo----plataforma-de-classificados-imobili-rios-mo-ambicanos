import { protectedProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";

export const getUserPropertiesProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    try {
      // Get properties owned by the current user
      const properties = Array.from(ctx.db.properties.values())
        .filter((property: any) => property.ownerId === ctx.userId);
      
      // Sort by creation date (newest first)
      properties.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Get the owner data
      const owner = ctx.db.users.get(ctx.userId);
      
      // Transform the data to match the expected format
      return properties.map((property: any) => ({
        ...property,
        owner: owner ? {
          id: owner.id,
          name: owner.name,
          phone: owner.phone,
          role: owner.role,
          isPremium: owner.role === 'premium',
        } : null,
      }));
    } catch (error) {
      console.error('Error fetching user properties:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch your properties',
      });
    }
  });