import { publicProcedure } from "@/backend/trpc/create-context";

export const getFeaturedPropertiesProcedure = publicProcedure
  .query(async ({ ctx }) => {
    try {
      // Get featured properties from the database
      const properties = await ctx.db.property.findMany({
        where: {
          featured: true,
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
      console.error('Error fetching featured properties:', error);
      throw new Error('Failed to fetch featured properties');
    }
  });