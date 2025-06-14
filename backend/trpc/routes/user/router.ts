import { z } from "zod";
import { router, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { hash, compare } from "bcryptjs";

export const userRouter = router({
  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if email is already taken
      if (input.email) {
        const existingUser = await ctx.prisma.user.findFirst({
          where: {
            email: input.email,
            id: {
              not: ctx.user.id,
            },
          },
        });
        
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use",
          });
        }
      }
      
      // Check if phone is already taken
      if (input.phone) {
        const existingUser = await ctx.prisma.user.findFirst({
          where: {
            phone: input.phone,
            id: {
              not: ctx.user.id,
            },
          },
        });
        
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Phone already in use",
          });
        }
      }
      
      // Update user
      const updatedUser = await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
        },
      });
      
      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        verified: updatedUser.verified,
        premiumUntil: updatedUser.premiumUntil,
        createdAt: updatedUser.createdAt,
      };
    }),
  
  // Change password
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get user with password
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
      });
      
      if (!user || !user.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change password for this account type",
        });
      }
      
      // Check current password
      const passwordValid = await compare(input.currentPassword, user.password);
      
      if (!passwordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }
      
      // Hash new password
      const hashedPassword = await hash(input.newPassword, 10);
      
      // Update password
      await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          password: hashedPassword,
        },
      });
      
      return {
        success: true,
        message: "Password changed successfully",
      };
    }),
});