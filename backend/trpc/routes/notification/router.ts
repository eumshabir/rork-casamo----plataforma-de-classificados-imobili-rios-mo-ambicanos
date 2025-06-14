import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../create-context";

export const notificationRouter = createTRPCRouter({
  // Get all notifications for the current user
  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    const notifications = await ctx.prisma.notification.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
    });
    
    return notifications;
  }),
  
  // Mark a notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.notification.updateMany({
        where: {
          id: input.notificationId,
          userId: ctx.user.id,
        },
        data: { read: true },
      });
      
      return { success: true };
    }),
  
  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.notification.updateMany({
      where: {
        userId: ctx.user.id,
        read: false,
      },
      data: { read: true },
    });
    
    return { success: true };
  }),
  
  // Delete a notification
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.notification.deleteMany({
        where: {
          id: input.notificationId,
          userId: ctx.user.id,
        },
      });
      
      return { success: true };
    }),
  
  // Get unread notification count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.notification.count({
      where: {
        userId: ctx.user.id,
        read: false,
      },
    });
    
    return { count };
  }),
  
  // Register device token for push notifications
  registerDevice: protectedProcedure
    .input(z.object({
      token: z.string(),
      platform: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if token already exists
      const existingToken = await ctx.prisma.$queryRaw`
        SELECT id FROM "DeviceToken" WHERE token = ${input.token}
      `;
      
      if (existingToken && Array.isArray(existingToken) && existingToken.length > 0) {
        // Update existing token
        await ctx.prisma.$executeRaw`
          UPDATE "DeviceToken" 
          SET "userId" = ${ctx.user.id}, "platform" = ${input.platform}, "updatedAt" = NOW()
          WHERE token = ${input.token}
        `;
      } else {
        // Create new token
        await ctx.prisma.$executeRaw`
          INSERT INTO "DeviceToken" ("token", "platform", "userId", "createdAt", "updatedAt")
          VALUES (${input.token}, ${input.platform}, ${ctx.user.id}, NOW(), NOW())
        `;
      }
      
      return { success: true };
    }),
  
  // Update notification settings
  updateSettings: protectedProcedure
    .input(z.object({
      newMessages: z.boolean(),
      propertyViews: z.boolean(),
      paymentUpdates: z.boolean(),
      promotions: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if settings already exist
      const existingSettings = await ctx.prisma.notificationSettings.findUnique({
        where: { userId: ctx.user.id },
      });
      
      if (existingSettings) {
        // Update existing settings
        await ctx.prisma.notificationSettings.update({
          where: { userId: ctx.user.id },
          data: input,
        });
      } else {
        // Create new settings
        await ctx.prisma.notificationSettings.create({
          data: {
            userId: ctx.user.id,
            ...input,
          },
        });
      }
      
      return { success: true };
    }),
  
  // Get notification settings
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.notificationSettings.findUnique({
      where: { userId: ctx.user.id },
    });
    
    if (!settings) {
      // Return default settings
      return {
        newMessages: true,
        propertyViews: true,
        paymentUpdates: true,
        promotions: true,
      };
    }
    
    return settings;
  }),
});