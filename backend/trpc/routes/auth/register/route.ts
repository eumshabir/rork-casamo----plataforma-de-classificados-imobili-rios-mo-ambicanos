import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const registerProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string(),
      password: z.string().min(6),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      // Check if the email is already in use
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email already in use',
        });
      }
      
      // Hash the password
      const passwordHash = await bcrypt.hash(input.password, 10);
      
      // Create the user
      const user = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          passwordHash,
          role: 'user',
          verified: false,
        },
      });
      
      // Generate a JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: '30d',
      });
      
      // Return the user and token
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          verified: user.verified,
          createdAt: user.createdAt.toISOString(),
        },
        token,
      };
    } catch (error) {
      console.error('Register error:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during registration',
      });
    }
  });