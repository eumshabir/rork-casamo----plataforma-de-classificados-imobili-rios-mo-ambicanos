import { z } from "zod";
import { adminProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";

export const getUsersProcedure = adminProcedure
  .input(
    z.object({
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().default(10),
      search: z.string().optional(),
      role: z.string().optional(),
    }).optional()
  )
  .query(async ({ input, ctx }) => {
    try {
      const page = input?.page || 1;
      const limit = input?.limit || 10;
      const skip = (page - 1) * limit;
      
      // Build the filter object based on the input
      const filter: any = {};
      
      if (input?.search) {
        filter.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
        ];
      }
      
      if (input?.role) {
        filter.role = input.role;
      }
      
      // Get users from the database with filters
      const users = await ctx.prisma.user.findMany({
        where: filter,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          verified: true,
          createdAt: true,
          premiumUntil: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      });
      
      // Get the total count of users matching the filter
      const totalCount = await ctx.prisma.user.count({
        where: filter,
      });
      
      // Transform the data to match the expected format
      return {
        users: users.map((user) => ({
          ...user,
          phone: user.phone || '',
          createdAt: user.createdAt.toISOString(),
          premiumUntil: user.premiumUntil ? user.premiumUntil.toISOString() : null,
          isPremium: user.role === 'premium',
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch users',
      });
    }
  });