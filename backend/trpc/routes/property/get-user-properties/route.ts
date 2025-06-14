import { protectedProcedure } from "@/backend/trpc/create-context";

export const getUserPropertiesProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    try {
      // Get properties owned by the current user
      const properties = await ctx.db.property.findMany({
        where: {
          ownerId: ctx.userId,
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
      console.error('Error fetching user properties:', error);
      throw new Error('Failed to fetch your properties');
    }
  });