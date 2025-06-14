import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";

export const getUserPropertiesProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    try {
      // Get properties owned by the current user
      const properties = await ctx.prisma.property.findMany({
        where: {
          ownerId: ctx.userId,
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
      console.error('Error fetching user properties:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user properties',
      });
    }
  });