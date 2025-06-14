import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export const createContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts;
  
  // Get the session from the request
  const auth = getAuth(req);
  const userId = auth.userId;
  
  return {
    userId,
    db: prisma,
    auth,
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
  const user = await ctx.db.user.findUnique({
    where: { id: ctx.userId },
  });
  
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