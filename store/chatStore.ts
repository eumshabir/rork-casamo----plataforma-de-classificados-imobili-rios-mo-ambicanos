import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService, ChatConversation, ChatMessage } from '@/services/chatService';

interface ChatState {
  conversations: ChatConversation[];
  currentConversation: string | null;
  messages: Record<string, ChatMessage[]>;
  isLoading: boolean;
  error: string | null;
  
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, receiverId: string) => Promise<void>;
  createConversation: (receiverId: string, initialMessage: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  setCurrentConversation: (conversationId: string | null) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      messages: {},
      isLoading: false,
      error: null,
      
      fetchConversations: async () => {
        set({ isLoading: true, error: null });
        try {
          const conversations = await chatService.getConversations();
          set({ conversations, isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Erro ao carregar conversas' 
          });
        }
      },
      
      fetchMessages: async (conversationId) => {
        set({ isLoading: true, error: null });
        try {
          const messages = await chatService.getMessages(conversationId);
          set(state => ({ 
            messages: { ...state.messages, [conversationId]: messages },
            isLoading: false 
          }));
          
          // Mark messages as read
          await chatService.markAsRead(conversationId);
          
          // Update unread count in conversations
          set(state => ({
            conversations: state.conversations.map(conv => 
              conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
            )
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Erro ao carregar mensagens' 
          });
        }
      },
      
      sendMessage: async (content, receiverId) => {
        const { currentConversation } = get();
        set({ isLoading: true, error: null });
        
        try {
          if (!currentConversation) {
            throw new Error('Nenhuma conversa selecionada');
          }
          
          const message = await chatService.sendMessage(currentConversation, content, receiverId);
          
          // Update messages
          set(state => {
            const conversationMessages = state.messages[currentConversation] || [];
            return {
              messages: {
                ...state.messages,
                [currentConversation]: [...conversationMessages, message]
              },
              isLoading: false
            };
          });
          
          // Update conversation last message
          set(state => ({
            conversations: state.conversations.map(conv => 
              conv.id === currentConversation 
                ? { 
                    ...conv, 
                    lastMessage: message,
                    updatedAt: message.createdAt
                  } 
                : conv
            )
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Erro ao enviar mensagem' 
          });
        }
      },
      
      createConversation: async (receiverId, initialMessage) => {
        set({ isLoading: true, error: null });
        try {
          const conversation = await chatService.createConversation(receiverId, initialMessage);
          
          // Add new conversation to list
          set(state => ({
            conversations: [conversation, ...state.conversations],
            currentConversation: conversation.id,
            messages: {
              ...state.messages,
              [conversation.id]: conversation.lastMessage ? [conversation.lastMessage] : []
            },
            isLoading: false
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Erro ao criar conversa' 
          });
        }
      },
      
      markAsRead: async (conversationId) => {
        try {
          await chatService.markAsRead(conversationId);
          
          // Update unread count in conversations
          set(state => ({
            conversations: state.conversations.map(conv => 
              conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
            )
          }));
        } catch (error) {
          console.error('Error marking conversation as read:', error);
        }
      },
      
      deleteConversation: async (conversationId) => {
        set({ isLoading: true, error: null });
        try {
          await chatService.deleteConversation(conversationId);
          
          // Remove conversation from list
          set(state => {
            const newMessages = { ...state.messages };
            delete newMessages[conversationId];
            
            return {
              conversations: state.conversations.filter(conv => conv.id !== conversationId),
              currentConversation: state.currentConversation === conversationId ? null : state.currentConversation,
              messages: newMessages,
              isLoading: false
            };
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Erro ao excluir conversa' 
          });
        }
      },
      
      setCurrentConversation: (conversationId) => {
        set({ currentConversation: conversationId });
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages
      })
    }
  )
);