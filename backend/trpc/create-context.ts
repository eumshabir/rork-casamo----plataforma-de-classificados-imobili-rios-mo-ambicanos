import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import jwt from 'jsonwebtoken';

// Define a simple user type for now
type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  verified: boolean;
  passwordHash?: string;
  createdAt: Date;
  premiumUntil?: Date | null;
};

// Mock database client
// In a real app, you would use PrismaClient
const mockPrisma = {
  user: {
    findUnique: async ({ where }: { where: { id: string } | { email: string } }) => {
      // Mock implementation
      return null as User | null;
    },
    create: async ({ data }: { data: any }) => {
      // Mock implementation
      return {
        id: 'mock-id',
        ...data,
        createdAt: new Date(),
      } as User;
    }
  },
  property: {
    findMany: async ({ where, orderBy, include, take }: any) => {
      // Mock implementation
      return [];
    },
    findUnique: async ({ where, include }: any) => {
      // Mock implementation
      return null;
    },
    create: async ({ data }: any) => {
      // Mock implementation
      return {
        id: 'mock-id',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    update: async ({ where, data }: any) => {
      // Mock implementation
      return {
        id: where.id,
        ...data,
        updatedAt: new Date(),
      };
    },
    delete: async ({ where }: any) => {
      // Mock implementation
      return { id: where.id };
    }
  }
};

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
      const user = await mockPrisma.user.findUnique({
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
    prisma: mockPrisma,
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