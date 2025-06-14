import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight, MessageSquare, Home, CreditCard } from 'lucide-react-native';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import Colors from '@/constants/colors';

export default function NotificationsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { 
    notifications, 
    isLoading, 
    error, 
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotificationStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);
  
  const handleNotificationPress = async (notification: any) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.data?.type === 'chat' && notification.data?.conversationId) {
      router.push(`/chat/${notification.data.conversationId}`);
    } else if (notification.data?.type === 'property' && notification.data?.propertyId) {
      router.push(`/property/${notification.data.propertyId}`);
    } else if (notification.data?.type === 'payment' && notification.data?.paymentId) {
      router.push('/profile/payments');
    }
  };
  
  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'chat':
        return <MessageSquare size={24} color={Colors.primary} />;
      case 'property':
        return <Home size={24} color={Colors.primary} />;
      case 'payment':
        return <CreditCard size={24} color={Colors.primary} />;
      default:
        return <Bell size={24} color={Colors.primary} />;
    }
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If less than 24 hours ago, show time
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) {
      if (diffHours < 1) {
        const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return diffMinutes < 1 ? 'Agora' : `${diffMinutes} min atrás`;
      }
      return `${diffHours} h atrás`;
    }
    
    // If less than 7 days ago, show day
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} atrás`;
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };
  
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Bell size={60} color={Colors.textLight} />
        <Text style={styles.authTitle}>Faça login para ver suas notificações</Text>
        <Text style={styles.authText}>
          Entre na sua conta para receber atualizações sobre seus imóveis e mensagens.
        </Text>
        <TouchableOpacity 
          style={styles.authButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.authButtonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Ocorreu um erro ao carregar as notificações. Tente novamente.
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchNotifications()}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Bell size={60} color={Colors.textLight} />
        <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
        <Text style={styles.emptyText}>
          Você não tem notificações no momento.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {notifications.some(n => !n.read) && (
        <TouchableOpacity 
          style={styles.markAllButton}
          onPress={() => markAllAsRead()}
        >
          <Text style={styles.markAllText}>Marcar todas como lidas</Text>
        </TouchableOpacity>
      )}
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.notificationItem,
              !item.read && styles.unreadNotification
            ]}
            onPress={() => handleNotificationPress(item)}
          >
            <View style={styles.iconContainer}>
              {getNotificationIcon(item.data?.type)}
            </View>
            
            <View style={styles.notificationContent}>
              <Text 
                style={[
                  styles.notificationTitle,
                  !item.read && styles.unreadText
                ]}
              >
                {item.title}
              </Text>
              
              <Text style={styles.notificationBody}>
                {item.body}
              </Text>
              
              <Text style={styles.notificationTime}>
                {formatTime(item.createdAt)}
              </Text>
            </View>
            
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  markAllButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
    marginRight: 16,
  },
  markAllText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unreadNotification: {
    backgroundColor: `${Colors.primaryLight}20`,
    borderColor: Colors.primaryLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primaryLight}30`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '700',
  },
  notificationBody: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  authText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});