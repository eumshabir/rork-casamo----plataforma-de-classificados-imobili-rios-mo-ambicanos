import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';

// We'll use a simple in-memory database for now
// Later we can integrate with Prisma when it's properly set up
const db = {
  users: new Map(),
  properties: new Map(),
  // Add more collections as needed
};

export const createContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts;
  
  // For now, we'll use a simple auth check
  // Later we can integrate with Clerk or another auth provider
  const authHeader = req.headers.authorization;
  let userId = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Simple token validation - in production use proper JWT validation
    try {
      // This is a placeholder - in real app, decode and verify the JWT
      userId = token; // In real app, this would be decoded from JWT
    } catch (error) {
      console.error('Auth error:', error);
    }
  }
  
  return {
    userId,
    db,
  };
};

const t = initTRPC.context<typeof createContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to check if user is authenticated
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      userId: ctx.userId,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

// Middleware to check if user is an admin
const isAdmin = t.middleware(async ({ next, ctx }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  // Get the user from the database
  const user = ctx.db.users.get(ctx.userId);
  
  if (!user || user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have permission to access this resource',
    });
  }
  
  return next({
    ctx: {
      userId: ctx.userId,
      user,
    },
  });
});

export const adminProcedure = t.procedure.use(isAdmin);