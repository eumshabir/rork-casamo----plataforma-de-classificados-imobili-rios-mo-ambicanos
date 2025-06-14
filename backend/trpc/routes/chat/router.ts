import { z } from "zod";
import { router, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const chatRouter = router({
  // Get all conversations for the current user
  getConversations: protectedProcedure
    .query(async ({ ctx }) => {
      const conversations = await ctx.prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              id: ctx.user.id,
            },
          },
        },
        include: {
          participants: {
            where: {
              id: {
                not: ctx.user.id,
              },
            },
            select: {
              id: true,
              name: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      
      // Get unread counts for each conversation
      const conversationsWithUnreadCount = await Promise.all(
        conversations.map(async (conversation) => {
          const unreadCount = await ctx.prisma.message.count({
            where: {
              conversationId: conversation.id,
              receiverId: ctx.user.id,
              read: false,
            },
          });
          
          return {
            id: conversation.id,
            participants: conversation.participants.map(participant => ({
              id: participant.id,
              name: participant.name,
              avatar: undefined, // In a real app, you would include avatar URL
            })),
            lastMessage: conversation.messages[0] || undefined,
            unreadCount,
            updatedAt: conversation.updatedAt.toISOString(),
          };
        })
      );
      
      return conversationsWithUnreadCount;
    }),
  
  // Get messages for a specific conversation
  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Check if user is part of the conversation
      const conversation = await ctx.prisma.conversation.findFirst({
        where: {
          id: input.conversationId,
          participants: {
            some: {
              id: ctx.user.id,
            },
          },
        },
      });
      
      if (!conversation) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this conversation",
        });
      }
      
      // Get messages
      const messages = await ctx.prisma.message.findMany({
        where: {
          conversationId: input.conversationId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      
      return messages;
    }),
  
  // Send a message
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string(),
        receiverId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { conversationId, content, receiverId } = input;
      
      // Check if user is part of the conversation
      const conversation = await ctx.prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participants: {
            some: {
              id: ctx.user.id,
            },
          },
        },
      });
      
      if (!conversation) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this conversation",
        });
      }
      
      // Create message
      const message = await ctx.prisma.message.create({
        data: {
          content,
          senderId: ctx.user.id,
          receiverId,
          conversationId,
        },
      });
      
      // Update conversation updatedAt
      await ctx.prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      });
      
      // Create notification for receiver
      await ctx.prisma.notification.create({
        data: {
          title: "Nova mensagem",
          body: `${ctx.user.name} enviou uma mensagem para você`,
          data: {
            type: "chat",
            conversationId,
          },
          userId: receiverId,
        },
      });
      
      return message;
    }),
  
  // Create a new conversation
  createConversation: protectedProcedure
    .input(
      z.object({
        receiverId: z.string(),
        initialMessage: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { receiverId, initialMessage } = input;
      
      // Check if receiver exists
      const receiver = await ctx.prisma.user.findUnique({
        where: {
          id: receiverId,
        },
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
          AND: [
            {
              participants: {
                some: {
                  id: ctx.user.id,
                },
              },
            },
            {
              participants: {
                some: {
                  id: receiverId,
                },
              },
            },
          ],
        },
      });
      
      if (existingConversation) {
        // Send message to existing conversation
        const message = await ctx.prisma.message.create({
          data: {
            content: initialMessage,
            senderId: ctx.user.id,
            receiverId,
            conversationId: existingConversation.id,
          },
        });
        
        // Update conversation updatedAt
        await ctx.prisma.conversation.update({
          where: {
            id: existingConversation.id,
          },
          data: {
            updatedAt: new Date(),
          },
        });
        
        // Create notification for receiver
        await ctx.prisma.notification.create({
          data: {
            title: "Nova mensagem",
            body: `${ctx.user.name} enviou uma mensagem para você`,
            data: {
              type: "chat",
              conversationId: existingConversation.id,
            },
            userId: receiverId,
          },
        });
        
        // Get conversation with participants
        const conversation = await ctx.prisma.conversation.findUnique({
          where: {
            id: existingConversation.id,
          },
          include: {
            participants: {
              where: {
                id: {
                  not: ctx.user.id,
                },
              },
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        
        if (!conversation) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get conversation",
          });
        }
        
        return {
          id: conversation.id,
          participants: conversation.participants.map(participant => ({
            id: participant.id,
            name: participant.name,
            avatar: undefined, // In a real app, you would include avatar URL
          })),
          lastMessage: message,
          unreadCount: 0,
          updatedAt: conversation.updatedAt.toISOString(),
        };
      }
      
      // Create new conversation
      const conversation = await ctx.prisma.conversation.create({
        data: {
          participants: {
            connect: [
              { id: ctx.user.id },
              { id: receiverId },
            ],
          },
        },
        include: {
          participants: {
            where: {
              id: {
                not: ctx.user.id,
              },
            },
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      
      // Create initial message
      const message = await ctx.prisma.message.create({
        data: {
          content: initialMessage,
          senderId: ctx.user.id,
          receiverId,
          conversationId: conversation.id,
        },
      });
      
      // Create notification for receiver
      await ctx.prisma.notification.create({
        data: {
          title: "Nova mensagem",
          body: `${ctx.user.name} iniciou uma conversa com você`,
          data: {
            type: "chat",
            conversationId: conversation.id,
          },
          userId: receiverId,
        },
      });
      
      return {
        id: conversation.id,
        participants: conversation.participants.map(participant => ({
          id: participant.id,
          name: participant.name,
          avatar: undefined, // In a real app, you would include avatar URL
        })),
        lastMessage: message,
        unreadCount: 0,
        updatedAt: conversation.updatedAt.toISOString(),
      };
    }),
  
  // Mark messages as read
  markAsRead: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is part of the conversation
      const conversation = await ctx.prisma.conversation.findFirst({
        where: {
          id: input.conversationId,
          participants: {
            some: {
              id: ctx.user.id,
            },
          },
        },
      });
      
      if (!conversation) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this conversation",
        });
      }
      
      // Mark messages as read
      await ctx.prisma.message.updateMany({
        where: {
          conversationId: input.conversationId,
          receiverId: ctx.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });
      
      return {
        success: true,
        message: "Messages marked as read",
      };
    }),
  
  // Delete a conversation
  deleteConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is part of the conversation
      const conversation = await ctx.prisma.conversation.findFirst({
        where: {
          id: input.conversationId,
          participants: {
            some: {
              id: ctx.user.id,
            },
          },
        },
      });
      
      if (!conversation) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this conversation",
        });
      }
      
      // Delete messages
      await ctx.prisma.message.deleteMany({
        where: {
          conversationId: input.conversationId,
        },
      });
      
      // Delete conversation
      await ctx.prisma.conversation.delete({
        where: {
          id: input.conversationId,
        },
      });
      
      return {
        success: true,
        message: "Conversation deleted",
      };
    }),
});