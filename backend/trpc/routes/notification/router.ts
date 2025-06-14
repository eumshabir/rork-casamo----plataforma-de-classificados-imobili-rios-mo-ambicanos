import { z } from "zod";
import { router, protectedProcedure } from "../../trpc";

export const notificationRouter = router({
  // Get all notifications for the current user
  getNotifications: protectedProcedure
    .query(async ({ ctx }) => {
      const notifications = await ctx.prisma.notification.findMany({
        where: {
          userId: ctx.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return notifications;
    }),
  
  // Mark a notification as read
  markAsRead: protectedProcedure
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.notification.updateMany({
        where: {
          id: input.notificationId,
          userId: ctx.user.id,
        },
        data: {
          read: true,
        },
      });
      
      return {
        success: true,
        message: "Notification marked as read",
      };
    }),
  
  // Mark all notifications as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      await ctx.prisma.notification.updateMany({
        where: {
          userId: ctx.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });
      
      return {
        success: true,
        message: "All notifications marked as read",
      };
    }),
  
  // Delete a notification
  deleteNotification: protectedProcedure
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.notification.deleteMany({
        where: {
          id: input.notificationId,
          userId: ctx.user.id,
        },
      });
      
      return {
        success: true,
        message: "Notification deleted",
      };
    }),
  
  // Get unread notification count
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const count = await ctx.prisma.notification.count({
        where: {
          userId: ctx.user.id,
          read: false,
        },
      });
      
      return {
        count,
      };
    }),
  
  // Register device for push notifications
  registerDevice: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        platform: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if device already exists
      const existingDevice = await ctx.prisma.device.findUnique({
        where: {
          token: input.token,
        },
      });
      
      if (existingDevice) {
        // Update device if it belongs to a different user
        if (existingDevice.userId !== ctx.user.id) {
          await ctx.prisma.device.update({
            where: {
              token: input.token,
            },
            data: {
              userId: ctx.user.id,
              platform: input.platform,
            },
          });
        }
      } else {
        // Create new device
        await ctx.prisma.device.create({
          data: {
            token: input.token,
            platform: input.platform,
            userId: ctx.user.id,
          },
        });
      }
      
      return {
        success: true,
        message: "Device registered successfully",
      };
    }),
  
  // Get notification settings
  getSettings: protectedProcedure
    .query(async () => {
      // In a real app, you would store these settings in the database
      // For now, we'll just return default settings
      
      return {
        newMessages: true,
        propertyViews: true,
        paymentUpdates: true,
        promotions: true,
      };
    }),
  
  // Update notification settings
  updateSettings: protectedProcedure
    .input(
      z.object({
        newMessages: z.boolean(),
        propertyViews: z.boolean(),
        paymentUpdates: z.boolean(),
        promotions: z.boolean(),
      })
    )
    .mutation(async () => {
      // In a real app, you would store these settings in the database
      // For now, we'll just return success
      
      return {
        success: true,
        message: "Notification settings updated",
      };
    }),
});