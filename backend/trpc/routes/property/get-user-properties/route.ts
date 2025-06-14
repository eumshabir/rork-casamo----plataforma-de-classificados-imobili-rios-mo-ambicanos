import { protectedProcedure } from '@/backend/trpc/create-context';

export const getUserPropertiesProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const properties = await ctx.prisma.property.findMany({
      where: {
        ownerId: ctx.userId,
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