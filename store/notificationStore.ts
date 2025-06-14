import { create } from 'zustand';
import { AppNotification, notificationService } from '@/services/notificationService';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  getUnreadCount: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  
  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await notificationService.getNotifications();
      set({ 
        notifications, 
        unreadCount: notifications.filter(n => !n.read).length,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erro ao carregar notificações' 
      });
    }
  },
  
  markAsRead: async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update notification in state
      set(state => {
        const updatedNotifications = state.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        
        return {
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(n => !n.read).length
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao marcar notificação como lida' 
      });
    }
  },
  
  markAllAsRead: async () => {
    set({ isLoading: true, error: null });
    try {
      await notificationService.markAllAsRead();
      
      // Update all notifications in state
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erro ao marcar todas notificações como lidas' 
      });
    }
  },
  
  deleteNotification: async (notificationId) => {
    set({ isLoading: true, error: null });
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Remove notification from state
      set(state => {
        const updatedNotifications = state.notifications.filter(n => n.id !== notificationId);
        return {
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(n => !n.read).length,
          isLoading: false
        };
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erro ao excluir notificação' 
      });
    }
  },
  
  getUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error('Error getting unread count:', error);
    }
  },
  
  clearError: () => {
    set({ error: null });
  }
}));