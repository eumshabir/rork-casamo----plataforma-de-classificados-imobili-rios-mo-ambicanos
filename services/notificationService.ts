import { handleApiError, shouldUseTRPC } from './api';
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

// Mock notifications
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Novo contacto',
    body: 'Maria Costa enviou uma mensagem sobre o seu imóvel.',
    data: { type: 'chat', conversationId: 'conv-1' },
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-2',
    title: 'Destaque expirado',
    body: 'O destaque do seu imóvel "Apartamento T3 na Polana" expirou.',
    data: { type: 'property', propertyId: '1' },
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-3',
    title: 'Pagamento confirmado',
    body: 'Seu pagamento de 1500 MZN para o plano Premium Mensal foi confirmado.',
    data: { type: 'payment', paymentId: 'pay-001' },
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Configure Expo Notifications
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

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
        if (await shouldUseTRPC()) {
          await trpcClient.notification.registerDevice.mutate({
            token,
            platform: Platform.OS,
          });
        }
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
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.notification.getNotifications.query();
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 800));
      return MOCK_NOTIFICATIONS;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        const result = await trpcClient.notification.markAsRead.mutate({ notificationId });
        return result.success;
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update mock data
      const notificationIndex = MOCK_NOTIFICATIONS.findIndex(n => n.id === notificationId);
      if (notificationIndex !== -1) {
        MOCK_NOTIFICATIONS[notificationIndex].read = true;
      }
      
      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Mark all notifications as read
  markAllAsRead: async (): Promise<boolean> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        const result = await trpcClient.notification.markAllAsRead.mutate();
        return result.success;
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update mock data
      MOCK_NOTIFICATIONS.forEach(notification => {
        notification.read = true;
      });
      
      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<boolean> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        const result = await trpcClient.notification.deleteNotification.mutate({ notificationId });
        return result.success;
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Update mock data
      const notificationIndex = MOCK_NOTIFICATIONS.findIndex(n => n.id === notificationId);
      if (notificationIndex !== -1) {
        MOCK_NOTIFICATIONS.splice(notificationIndex, 1);
      }
      
      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        const result = await trpcClient.notification.getUnreadCount.query();
        return result.count;
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Count unread notifications
      return MOCK_NOTIFICATIONS.filter(n => !n.read).length;
    } catch (error) {
      throw new Error(handleApiError(error));
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
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        const result = await trpcClient.notification.updateSettings.mutate(settings);
        return result.success;
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Save settings to AsyncStorage
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
      
      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
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
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.notification.getSettings.query();
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Get settings from AsyncStorage
      const settings = await AsyncStorage.getItem('notification_settings');
      
      if (settings) {
        return JSON.parse(settings);
      }
      
      // Default settings
      return {
        newMessages: true,
        propertyViews: true,
        paymentUpdates: true,
        promotions: true
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};