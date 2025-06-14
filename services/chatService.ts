import { handleApiError, shouldUseTRPC } from './api';
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

// Mock data for conversations
const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    participants: [
      {
        id: '2',
        name: 'Maria Costa',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
      }
    ],
    lastMessage: {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: '2',
      receiverId: '1',
      content: 'Olá, o imóvel ainda está disponível?',
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'conv-2',
    participants: [
      {
        id: '3',
        name: 'Carlos Matlombe',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      }
    ],
    lastMessage: {
      id: 'msg-2',
      conversationId: 'conv-2',
      senderId: '1',
      receiverId: '3',
      content: 'Sim, podemos marcar uma visita para amanhã às 15h.',
      read: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock data for messages
const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: '2',
      receiverId: '1',
      content: 'Olá, estou interessado no seu apartamento na Polana.',
      read: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: '2',
      receiverId: '1',
      content: 'Olá, o imóvel ainda está disponível?',
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ],
  'conv-2': [
    {
      id: 'msg-4',
      conversationId: 'conv-2',
      senderId: '3',
      receiverId: '1',
      content: 'Bom dia, gostaria de agendar uma visita ao imóvel.',
      read: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'msg-2',
      conversationId: 'conv-2',
      senderId: '1',
      receiverId: '3',
      content: 'Sim, podemos marcar uma visita para amanhã às 15h.',
      read: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

export const chatService = {
  // Get all conversations for the current user
  getConversations: async (): Promise<ChatConversation[]> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.chat.getConversations.query();
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 800));
      return MOCK_CONVERSATIONS;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Get messages for a specific conversation
  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.chat.getMessages.query({ conversationId });
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 600));
      return MOCK_MESSAGES[conversationId] || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Send a message
  sendMessage: async (conversationId: string, content: string, receiverId: string): Promise<ChatMessage> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.chat.sendMessage.mutate({
          conversationId,
          content,
          receiverId,
        });
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: '1', // Current user ID
        receiverId,
        content,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Add to mock data
      if (!MOCK_MESSAGES[conversationId]) {
        MOCK_MESSAGES[conversationId] = [];
      }
      
      MOCK_MESSAGES[conversationId].push(newMessage);
      
      // Update last message in conversation
      const conversationIndex = MOCK_CONVERSATIONS.findIndex(c => c.id === conversationId);
      if (conversationIndex !== -1) {
        MOCK_CONVERSATIONS[conversationIndex].lastMessage = newMessage;
        MOCK_CONVERSATIONS[conversationIndex].updatedAt = newMessage.createdAt;
      }
      
      return newMessage;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Create a new conversation
  createConversation: async (receiverId: string, initialMessage: string): Promise<ChatConversation> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.chat.createConversation.mutate({
          receiverId,
          initialMessage,
        });
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newConversationId = `conv-${Date.now()}`;
      
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: newConversationId,
        senderId: '1', // Current user ID
        receiverId,
        content: initialMessage,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Create mock conversation
      const newConversation: ChatConversation = {
        id: newConversationId,
        participants: [
          {
            id: receiverId,
            name: 'Novo Contacto',
            avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
          }
        ],
        lastMessage: newMessage,
        unreadCount: 0,
        updatedAt: newMessage.createdAt
      };
      
      // Add to mock data
      MOCK_CONVERSATIONS.unshift(newConversation);
      MOCK_MESSAGES[newConversationId] = [newMessage];
      
      return newConversation;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Mark messages as read
  markAsRead: async (conversationId: string): Promise<boolean> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        const result = await trpcClient.chat.markAsRead.mutate({ conversationId });
        return result.success;
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update mock data
      if (MOCK_MESSAGES[conversationId]) {
        MOCK_MESSAGES[conversationId].forEach(msg => {
          if (msg.receiverId === '1') { // Current user is receiver
            msg.read = true;
          }
        });
      }
      
      // Update unread count in conversation
      const conversationIndex = MOCK_CONVERSATIONS.findIndex(c => c.id === conversationId);
      if (conversationIndex !== -1) {
        MOCK_CONVERSATIONS[conversationIndex].unreadCount = 0;
      }
      
      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Delete a conversation
  deleteConversation: async (conversationId: string): Promise<boolean> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        const result = await trpcClient.chat.deleteConversation.mutate({ conversationId });
        return result.success;
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from mock data
      const conversationIndex = MOCK_CONVERSATIONS.findIndex(c => c.id === conversationId);
      if (conversationIndex !== -1) {
        MOCK_CONVERSATIONS.splice(conversationIndex, 1);
      }
      
      delete MOCK_MESSAGES[conversationId];
      
      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};