import { z } from "zod";
import { adminProcedure } from "@/backend/trpc/create-context";

export const getUserByIdProcedure = adminProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { data: user, error } = await ctx.supabase
      .from('users')
      .select('*')
      .eq('id', input.userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Get user's properties count
    const { count: propertiesCount } = await ctx.supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', input.userId);

    // Get user's messages count
    const { count: messagesCount } = await ctx.supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', input.userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verified: user.verified,
      premiumUntil: user.premium_until,
      createdAt: user.created_at,
      stats: {
        propertiesCount: propertiesCount || 0,
        messagesCount: messagesCount || 0,
      },
    };
  });