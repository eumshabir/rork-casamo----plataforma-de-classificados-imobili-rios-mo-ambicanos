import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

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
      if (ctx.db.users.has(input.email)) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email already in use',
        });
      }
      
      // Hash the password
      const passwordHash = await bcrypt.hash(input.password, 10);
      
      // Create a unique ID
      const id = `user_${Date.now()}`;
      
      // Create the user
      const user = {
        id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: 'user',
        verified: false,
        createdAt: new Date().toISOString(),
      };
      
      // Store the user
      ctx.db.users.set(input.email, user);
      
      // Generate a simple token (in production use proper JWT)
      const token = id;
      
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