import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(notification => ({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      read: notification.read,
      createdAt: notification.created_at,
    }));
  },
  
  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },
  
  // Mark all notifications as read
  markAllAsRead: async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },
  
  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },
  
  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 0;
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      return 0;
    }

    return count || 0;
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

  // Create a notification in the database
  createNotification: async (userId: string, title: string, body: string, data?: any): Promise<AppNotification> => {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        body,
        data,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      read: notification.read,
      createdAt: notification.created_at,
    };
  },
  
  // Update notification settings
  updateSettings: async (settings: { 
    newMessages: boolean, 
    propertyViews: boolean, 
    paymentUpdates: boolean,
    promotions: boolean
  }): Promise<boolean> => {
    // Save settings to AsyncStorage
    await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
    return true;
  },
  
  // Get notification settings
  getSettings: async (): Promise<{ 
    newMessages: boolean, 
    propertyViews: boolean, 
    paymentUpdates: boolean,
    promotions: boolean
  }> => {
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
  },

  // Subscribe to real-time notifications
  subscribeToNotifications: (callback: (notification: AppNotification) => void) => {
    const { data: { user } } = supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    return supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as any;
          callback({
            id: notification.id,
            title: notification.title,
            body: notification.body,
            data: notification.data,
            read: notification.read,
            createdAt: notification.created_at,
          });
        }
      )
      .subscribe();
  },
};