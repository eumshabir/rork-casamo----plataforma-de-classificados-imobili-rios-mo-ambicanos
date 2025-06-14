import { z } from 'zod';
import { adminProcedure } from '@/backend/trpc/create-context';

export const getUsersProcedure = adminProcedure
  .input(z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    role: z.string().optional(),
  }).optional())
  .query(async ({ input, ctx }) => {
    const filters = input || {};
    
    const where: any = {};
    
    if (filters.role) {
      where.role = filters.role;
    }
    
    const users = await ctx.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        verified: true,
        premiumUntil: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters.limit,
      skip: filters.offset,
    });
    
    return users;
  });