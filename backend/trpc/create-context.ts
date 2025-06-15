import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import jwt from 'jsonwebtoken';

// Mock Prisma Client for now - replace with actual Prisma when database is set up
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  verified: boolean;
  premiumUntil?: string;
  createdAt: string;
}

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: string;
  listingType: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  location: any;
  amenities: string[];
  images: string[];
  featured: boolean;
  ownerId: string;
  createdAt: string;
  views: number;
}

// Mock database - replace with actual Prisma client
const mockPrisma = {
  user: {
    findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
      // Mock implementation - replace with actual database
      return null;
    },
    create: async (data: any) => {
      // Mock implementation - replace with actual database
      return data.data;
    },
    findMany: async () => {
      // Mock implementation - replace with actual database
      return [];
    },
  },
  property: {
    findMany: async (options?: any) => {
      // Mock implementation - replace with actual database
      return [];
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      // Mock implementation - replace with actual database
      return null;
    },
    create: async (data: any) => {
      // Mock implementation - replace with actual database
      return data.data;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      // Mock implementation - replace with actual database
      return data;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      // Mock implementation - replace with actual database
      return { id: where.id };
    },
  },
};

// JWT secret key - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
      prisma: ctx.prisma,
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
      prisma: ctx.prisma,
    },
  });
});

export const adminProcedure = t.procedure.use(isAdmin);