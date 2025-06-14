import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Initialize Prisma Client
const prisma = new PrismaClient();

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const createContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts;
  
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  let userId = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      // Verify and decode the JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
      
      // Check if the user exists in the database
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        userId = null;
      }
    } catch (error) {
      console.error('Auth error:', error);
      userId = null;
    }
  }
  
  return {
    userId,
    prisma,
  };
};

const t = initTRPC.context<typeof createContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to check if user is authenticated
const isAuthed = t.middleware(async ({ next, ctx }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  // Get the user from the database
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.userId },
  });
  
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User not found',
    });
  }
  
  return next({
    ctx: {
      userId: ctx.userId,
      user,
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
  const user = await ctx.prisma.user.findUnique({
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