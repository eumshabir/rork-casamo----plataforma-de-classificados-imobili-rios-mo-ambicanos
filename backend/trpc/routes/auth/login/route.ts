import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

export const loginProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      // Find the user by email
      const user = ctx.db.users.get(input.email);
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }
      
      // Check if the password is correct
      const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
      
      if (!isPasswordValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }
      
      // Generate a simple token (in production use proper JWT)
      const token = user.id;
      
      // Return the user and token
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          verified: user.verified,
          createdAt: user.createdAt,
          premiumUntil: user.premiumUntil,
        },
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during login',
      });
    }
  });