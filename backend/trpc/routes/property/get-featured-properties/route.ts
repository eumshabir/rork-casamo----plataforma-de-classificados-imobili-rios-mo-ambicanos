import { publicProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";

export const getFeaturedPropertiesProcedure = publicProcedure
  .query(async ({ ctx }) => {
    try {
      // Get featured properties from the database
      const properties = await ctx.prisma.property.findMany({
        where: {
          featured: true,
        },
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
        take: 10, // Limit to 10 featured properties
      });
      
      // Transform the data to match the expected format
      return properties.map((property: any) => ({
        ...property,
        createdAt: property.createdAt.toISOString(),
        updatedAt: property.updatedAt.toISOString(),
        owner: {
          ...property.owner,
          isPremium: property.owner.role === 'premium',
        },
      }));
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch featured properties',
      });
    }
  });