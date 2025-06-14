import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { hash, compare } from "bcryptjs";
// @ts-ignore - Add type declaration for jsonwebtoken
import { sign } from "jsonwebtoken";

export const authRouter = router({
  // Register a new user
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name, email, phone, password } = input;
      
      // Check if user already exists
      const existingUser = await ctx.prisma.user.findFirst({
        where: {
          OR: [
            { email },
            ...(phone ? [{ phone }] : []),
          ],
        },
      });
      
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email or phone already exists",
        });
      }
      
      // Hash the password
      const hashedPassword = await hash(password, 10);
      
      // Create the user
      const user = await ctx.prisma.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role: "user",
          verified: false,
        },
      });
      
      // Generate JWT token
      const token = sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );
      
      // Return user data (without password) and token
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
  
  // Login with email and password
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      
      // Find the user
      const user = await ctx.prisma.user.findUnique({
        where: { email },
      });
      
      if (!user || !user.password) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found or invalid credentials",
        });
      }
      
      // Check password
      const passwordValid = await compare(password, user.password);
      
      if (!passwordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }
      
      // Generate JWT token
      const token = sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );
      
      // Return user data (without password) and token
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
  
  // Login with phone
  loginWithPhone: publicProcedure
    .input(
      z.object({
        phone: z.string(),
        code: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { phone, code } = input;
      
      // In a real app, you would verify the code with an SMS service
      // For now, we'll just check if the code is "123456" (demo purposes)
      if (code !== "123456") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid verification code",
        });
      }
      
      // Find the user
      let user = await ctx.prisma.user.findUnique({
        where: { phone },
      });
      
      // If user doesn't exist, create a new one
      if (!user) {
        user = await ctx.prisma.user.create({
          data: {
            name: "User", // Default name
            phone,
            role: "user",
            verified: true, // Phone is verified
          },
        });
      } else {
        // Update user to mark phone as verified
        user = await ctx.prisma.user.update({
          where: { id: user.id },
          data: { verified: true },
        });
      }
      
      // Generate JWT token
      const token = sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
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
  
  // Request verification code
  requestVerificationCode: publicProcedure
    .input(
      z.object({
        phone: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { phone } = input;
      
      // In a real app, you would send an SMS with a verification code
      // For now, we'll just return success
      
      return {
        success: true,
        message: "Verification code sent",
      };
    }),
  
  // Verify phone
  verifyPhone: protectedProcedure
    .input(
      z.object({
        phone: z.string(),
        code: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { phone, code } = input;
      
      // In a real app, you would verify the code with an SMS service
      // For now, we'll just check if the code is "123456" (demo purposes)
      if (code !== "123456") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid verification code",
        });
      }
      
      // Update user to mark phone as verified
      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { 
          phone,
          verified: true 
        },
      });
      
      return {
        success: true,
        message: "Phone verified successfully",
      };
    }),
  
  // Reset password
  resetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input, ctx }) => {
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
      
      return {
        success: true,
        message: "Password reset instructions sent to your email",
      };
    }),
  
  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
});