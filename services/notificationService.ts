import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpcClient } from '@/lib/trpc';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

// Configure Expo Notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  // Register for push notifications
  registerForPushNotifications: async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return null;
    }
    
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      // Save token to AsyncStorage
      await AsyncStorage.setItem('push_token', token);
      
      // Register token with backend
      try {
        await trpcClient.notification.registerDevice.mutate({ token });
      } catch (error) {
        console.log('Error registering push token with backend:', error);
      }
      
      // Configure for Android
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      
      return token;
    } catch (error) {
      console.log('Error getting push token:', error);
      return null;
    }
  },
  
  // Get all notifications for the current user
  getNotifications: async (): Promise<AppNotification[]> => {
    try {
      const notifications = await trpcClient.notification.getNotifications.query();
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Falha ao buscar notificações');
    }
  },
  
  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      const result = await trpcClient.notification.markAsRead.mutate({ notificationId });
      return result.success;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Falha ao marcar notificação como lida');
    }
  },
  
  // Mark all notifications as read
  markAllAsRead: async (): Promise<boolean> => {
    try {
      const result = await trpcClient.notification.markAllAsRead.mutate();
      return result.success;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Falha ao marcar todas notificações como lidas');
    }
  },
  
  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<boolean> => {
    try {
      const result = await trpcClient.notification.deleteNotification.mutate({ notificationId });
      return result.success;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Falha ao excluir notificação');
    }
  },
  
  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    try {
      const result = await trpcClient.notification.getUnreadCount.query();
      return result.count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw new Error('Falha ao buscar contagem de notificações');
    }
  },
  
  // Send a local notification
  sendLocalNotification: async (title: string, body: string, data?: any): Promise<void> => {
    if (Platform.OS === 'web') {
      console.log('Local notifications not supported on web');
      return;
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
      },
      trigger: null, // Show immediately
    });
  },
  
  // Update notification settings
  updateSettings: async (settings: { 
    newMessages: boolean, 
    propertyViews: boolean, 
    paymentUpdates: boolean,
    promotions: boolean
  }): Promise<boolean> => {
    try {
      const result = await trpcClient.notification.updateSettings.mutate(settings);
      return result.success;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw new Error('Falha ao atualizar configurações de notificações');
    }
  },
  
  // Get notification settings
  getSettings: async (): Promise<{ 
    newMessages: boolean, 
    propertyViews: boolean, 
    paymentUpdates: boolean,
    promotions: boolean
  }> => {
    try {
      const settings = await trpcClient.notification.getSettings.query();
      return settings;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      
      // Default settings if we can't get from server
      return {
        newMessages: true,
        propertyViews: true,
        paymentUpdates: true,
        promotions: true
      };
    }
  }
};