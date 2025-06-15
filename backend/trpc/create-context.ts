import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { supabase } from "@/lib/supabase";

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Get the authorization header
  const authorization = opts.req.headers.get('authorization');
  
  let user = null;
  if (authorization) {
    try {
      // Extract the token from "Bearer <token>"
      const token = authorization.replace('Bearer ', '');
      
      // Verify the token with Supabase
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      
      if (!error && authUser) {
        // Get user profile from our users table
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (userProfile) {
          user = {
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            role: userProfile.role,
          };
        }
      }
    } catch (error) {
      // Invalid token, user remains null
      console.error('Error verifying token:', error);
    }
  }

  return {
    req: opts.req,
    user,
    supabase,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Admin procedure that requires admin role
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    });
  }
  return next({
    ctx,
  });
});