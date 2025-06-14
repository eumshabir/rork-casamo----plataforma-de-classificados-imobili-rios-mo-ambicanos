import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

// Input validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
});

const verifyPhoneSchema = z.object({
  phone: z.string(),
  code: z.string(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export const authRouter = createTRPCRouter({
  // Login with email and password
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;
      
      // Find user by email
      const user = await ctx.prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      
      // Check password
      const passwordValid = await compare(password, user.passwordHash);
      
      if (!passwordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }
      
      // Generate JWT token
      const token = sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      // Return user data and token
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          verified: user.verified,
          premiumUntil: user.premiumUntil,
          createdAt: user.createdAt,
        },
        token,
      };
    }),
  
  // Register new user
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, email, phone, password } = input;
      
      // Check if email already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already in use",
        });
      }
      
      // Hash password
      const passwordHash = await hash(password, 10);
      
      // Create new user
      const user = await ctx.prisma.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash,
          role: "user",
          verified: false,
        },
      });
      
      // Generate JWT token
      const token = sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      // Return user data and token
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
    }),
  
  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
  
  // Verify phone number
  verifyPhone: protectedProcedure
    .input(verifyPhoneSchema)
    .mutation(async ({ ctx, input }) => {
      const { phone, code } = input;
      
      // In a real app, you would verify the code with an SMS service
      // For now, we'll just check if the code is "123456" (as in the mock)
      if (code !== "123456") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }
      
      // Update user's phone and verified status
      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          phone,
          verified: true,
        },
      });
      
      return { success: true };
    }),
  
  // Request verification code
  requestVerificationCode: protectedProcedure
    .input(z.object({ phone: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { phone } = input;
      
      // In a real app, you would send an SMS with a verification code
      // For now, we'll just return success
      
      return { success: true };
    }),
  
  // Reset password
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { email } = input;
      
      // Check if user exists
      const user = await ctx.prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      
      // In a real app, you would send an email with a reset link
      // For now, we'll just return success
      
      return { success: true };
    }),
});