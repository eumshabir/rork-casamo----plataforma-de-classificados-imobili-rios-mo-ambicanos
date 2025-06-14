import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";
import { hash, compare } from "bcryptjs";

export const userRouter = createTRPCRouter({
  // Update user profile
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(2).optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if email is being changed and if it's already in use
      if (input.email && input.email !== ctx.user.email) {
        const existingUser = await ctx.prisma.user.findUnique({
          where: { email: input.email },
        });
        
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use",
          });
        }
      }
      
      // Update user
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: input,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          verified: true,
          premiumUntil: true,
          createdAt: true,
        },
      });
      
      return updatedUser;
    }),
  
  // Change password
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get user with password
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          passwordHash: true,
        },
      });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      
      // Check current password
      const passwordValid = await compare(input.currentPassword, user.passwordHash);
      
      if (!passwordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }
      
      // Hash new password
      const newPasswordHash = await hash(input.newPassword, 10);
      
      // Update password
      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { passwordHash: newPasswordHash },
      });
      
      return { success: true };
    }),
  
  // Get user statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Count user's properties
    const propertyCount = await ctx.prisma.property.count({
      where: { ownerId: ctx.user.id },
    });
    
    // Count user's favorites
    const favoriteCount = await ctx.prisma.favorite.count({
      where: { userId: ctx.user.id },
    });
    
    // Count total views of user's properties
    const viewsResult = await ctx.prisma.property.aggregate({
      where: { ownerId: ctx.user.id },
      _sum: { views: true },
    });
    
    const totalViews = viewsResult._sum.views || 0;
    
    // Check premium status
    const isPremium = ctx.user.role === "premium" && 
      ctx.user.premiumUntil && 
      new Date(ctx.user.premiumUntil) > new Date();
    
    // Get premium expiration date
    const premiumUntil = isPremium ? ctx.user.premiumUntil : null;
    
    return {
      propertyCount,
      favoriteCount,
      totalViews,
      isPremium,
      premiumUntil,
    };
  }),
  
  // Admin: Get all users
  getAllUsers: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        verified: true,
        premiumUntil: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    
    return users;
  }),
  
  // Admin: Update user
  adminUpdateUser: adminProcedure
    .input(z.object({
      userId: z.string(),
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      role: z.enum(["user", "premium", "admin"]).optional(),
      verified: z.boolean().optional(),
      premiumUntil: z.date().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, ...data } = input;
      
      // Check if user exists
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      
      // Update user
      const updatedUser = await ctx.prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          verified: true,
          premiumUntil: true,
          createdAt: true,
        },
      });
      
      return updatedUser;
    }),
  
  // Admin: Delete user
  adminDeleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user exists
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      
      // Delete user
      await ctx.prisma.user.delete({
        where: { id: input.userId },
      });
      
      return { success: true };
    }),
});