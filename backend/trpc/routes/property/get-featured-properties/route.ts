import { publicProcedure } from '@/backend/trpc/create-context';

export const getFeaturedPropertiesProcedure = publicProcedure
  .query(async ({ ctx }) => {
    const properties = await ctx.prisma.property.findMany({
      where: {
        featured: true,
      },
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
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