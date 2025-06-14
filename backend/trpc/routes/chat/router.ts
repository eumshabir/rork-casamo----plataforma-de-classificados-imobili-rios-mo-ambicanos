import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

export const chatRouter = createTRPCRouter({
  // Get all conversations for the current user
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await ctx.prisma.conversation.findMany({
      where: {
        messages: {
          some: {
            OR: [
              { senderId: ctx.user.id },
              { receiverId: ctx.user.id },
            ],
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    
    // Get participants for each conversation
    const conversationsWithParticipants = await Promise.all(
      conversations.map(async (conversation) => {
        // Get the last message
        const lastMessage = conversation.messages[0];
        
        // Get the other participant (not the current user)
        const otherParticipantId = lastMessage.senderId === ctx.user.id
          ? lastMessage.receiverId
          : lastMessage.senderId;
        
        const otherParticipant = await ctx.prisma.user.findUnique({
          where: { id: otherParticipantId },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });
        
        // Count unread messages
        const unreadCount = await ctx.prisma.message.count({
          where: {
            conversationId: conversation.id,
            receiverId: ctx.user.id,
            read: false,
          },
        });
        
        return {
          id: conversation.id,
          participants: [
            {
              id: otherParticipant?.id || "",
              name: otherParticipant?.name || "Unknown User",
              avatar: null, // In a real app, you would have user avatars
            },
          ],
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            conversationId: lastMessage.conversationId,
            senderId: lastMessage.senderId,
            receiverId: lastMessage.receiverId,
            content: lastMessage.content,
            read: lastMessage.read,
            createdAt: lastMessage.createdAt,
          } : undefined,
          unreadCount,
          updatedAt: conversation.updatedAt,
        };
      })
    );
    
    return conversationsWithParticipants;
  }),
  
  // Get messages for a specific conversation
  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if conversation exists and user is a participant
      const conversation = await ctx.prisma.conversation.findFirst({
        where: {
          id: input.conversationId,
          messages: {
            some: {
              OR: [
                { senderId: ctx.user.id },
                { receiverId: ctx.user.id },
              ],
            },
          },
        },
      });
      
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found or you don't have access",
        });
      }
      
      const messages = await ctx.prisma.message.findMany({
        where: { conversationId: input.conversationId },
        orderBy: { createdAt: "asc" },
      });
      
      return messages;
    }),
  
  // Send a message
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      content: z.string().min(1),
      receiverId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if conversation exists
      const conversation = await ctx.prisma.conversation.findUnique({
        where: { id: input.conversationId },
      });
      
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }
      
      // Create new message
      const message = await ctx.prisma.message.create({
        data: {
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          content: input.content,
          read: false,
        },
      });
      
      // Update conversation's updatedAt
      await ctx.prisma.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() },
      });
      
      // Create notification for the receiver
      await ctx.prisma.notification.create({
        data: {
          userId: input.receiverId,
          title: "Nova mensagem",
          body: `${ctx.user.name} enviou uma mensagem.`,
          data: {
            type: "chat",
            conversationId: input.conversationId,
          },
          read: false,
        },
      });
      
      return message;
    }),
  
  // Create a new conversation
  createConversation: protectedProcedure
    .input(z.object({
      receiverId: z.string(),
      initialMessage: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if receiver exists
      const receiver = await ctx.prisma.user.findUnique({
        where: { id: input.receiverId },
      });
      
      if (!receiver) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Receiver not found",
        });
      }
      
      // Check if conversation already exists
      const existingConversation = await ctx.prisma.conversation.findFirst({
        where: {
          messages: {
            some: {
              AND: [
                {
                  OR: [
                    { senderId: ctx.user.id },
                    { receiverId: ctx.user.id },
                  ],
                },
                {
                  OR: [
                    { senderId: input.receiverId },
                    { receiverId: input.receiverId },
                  ],
                },
              ],
            },
          },
        },
      });
      
      if (existingConversation) {
        // Send message to existing conversation
        const message = await ctx.prisma.message.create({
          data: {
            conversationId: existingConversation.id,
            senderId: ctx.user.id,
            receiverId: input.receiverId,
            content: input.initialMessage,
            read: false,
          },
        });
        
        // Update conversation's updatedAt
        await ctx.prisma.conversation.update({
          where: { id: existingConversation.id },
          data: { updatedAt: new Date() },
        });
        
        // Create notification for the receiver
        await ctx.prisma.notification.create({
          data: {
            userId: input.receiverId,
            title: "Nova mensagem",
            body: `${ctx.user.name} enviou uma mensagem.`,
            data: {
              type: "chat",
              conversationId: existingConversation.id,
            },
            read: false,
          },
        });
        
        return {
          id: existingConversation.id,
          participants: [
            {
              id: receiver.id,
              name: receiver.name,
              avatar: null, // In a real app, you would have user avatars
            },
          ],
          lastMessage: message,
          unreadCount: 0,
          updatedAt: new Date(),
        };
      }
      
      // Create new conversation
      const conversation = await ctx.prisma.conversation.create({
        data: {
          messages: {
            create: {
              senderId: ctx.user.id,
              receiverId: input.receiverId,
              content: input.initialMessage,
              read: false,
            },
          },
        },
        include: {
          messages: true,
        },
      });
      
      // Create notification for the receiver
      await ctx.prisma.notification.create({
        data: {
          userId: input.receiverId,
          title: "Nova mensagem",
          body: `${ctx.user.name} enviou uma mensagem.`,
          data: {
            type: "chat",
            conversationId: conversation.id,
          },
          read: false,
        },
      });
      
      return {
        id: conversation.id,
        participants: [
          {
            id: receiver.id,
            name: receiver.name,
            avatar: null, // In a real app, you would have user avatars
          },
        ],
        lastMessage: conversation.messages[0],
        unreadCount: 0,
        updatedAt: conversation.updatedAt,
      };
    }),
  
  // Mark messages as read
  markAsRead: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.message.updateMany({
        where: {
          conversationId: input.conversationId,
          receiverId: ctx.user.id,
          read: false,
        },
        data: { read: true },
      });
      
      return { success: true };
    }),
  
  // Delete a conversation
  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if conversation exists and user is a participant
      const conversation = await ctx.prisma.conversation.findFirst({
        where: {
          id: input.conversationId,
          messages: {
            some: {
              OR: [
                { senderId: ctx.user.id },
                { receiverId: ctx.user.id },
              ],
            },
          },
        },
      });
      
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found or you don't have access",
        });
      }
      
      // Delete all messages in the conversation
      await ctx.prisma.message.deleteMany({
        where: { conversationId: input.conversationId },
      });
      
      // Delete the conversation
      await ctx.prisma.conversation.delete({
        where: { id: input.conversationId },
      });
      
      return { success: true };
    }),
});