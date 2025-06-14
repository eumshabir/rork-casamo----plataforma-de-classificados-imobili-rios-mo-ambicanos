import { trpcClient } from '@/lib/trpc';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

export const chatService = {
  // Get all conversations for the current user
  getConversations: async (): Promise<ChatConversation[]> => {
    try {
      const conversations = await trpcClient.chat.getConversations.query();
      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw new Error('Falha ao buscar conversas');
    }
  },
  
  // Get messages for a specific conversation
  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    try {
      const messages = await trpcClient.chat.getMessages.query({ conversationId });
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Falha ao buscar mensagens');
    }
  },
  
  // Send a message
  sendMessage: async (conversationId: string, content: string, receiverId: string): Promise<ChatMessage> => {
    try {
      const message = await trpcClient.chat.sendMessage.mutate({
        conversationId,
        content,
        receiverId
      });
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Falha ao enviar mensagem');
    }
  },
  
  // Create a new conversation
  createConversation: async (receiverId: string, initialMessage: string): Promise<ChatConversation> => {
    try {
      const conversation = await trpcClient.chat.createConversation.mutate({
        receiverId,
        initialMessage
      });
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Falha ao criar conversa');
    }
  },
  
  // Mark messages as read
  markAsRead: async (conversationId: string): Promise<boolean> => {
    try {
      const result = await trpcClient.chat.markAsRead.mutate({ conversationId });
      return result.success;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw new Error('Falha ao marcar mensagens como lidas');
    }
  },
  
  // Delete a conversation
  deleteConversation: async (conversationId: string): Promise<boolean> => {
    try {
      const result = await trpcClient.chat.deleteConversation.mutate({ conversationId });
      return result.success;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw new Error('Falha ao excluir conversa');
    }
  }
};