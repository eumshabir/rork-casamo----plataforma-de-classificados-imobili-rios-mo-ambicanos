import { z } from "zod";
import { adminProcedure } from "@/backend/trpc/create-context";

export const getUsersProcedure = adminProcedure
  .input(
    z.object({
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(10),
      search: z.string().optional(),
      role: z.enum(['user', 'premium', 'admin']).optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, search, role } = input;
    const offset = (page - 1) * limit;

    let query = ctx.supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return {
      users: users?.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified,
        premiumUntil: user.premium_until,
        createdAt: user.created_at,
      })) || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  });