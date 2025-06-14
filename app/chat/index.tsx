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
import { Image } from 'expo-image';
import { MessageSquare, ChevronRight } from 'lucide-react-native';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import Colors from '@/constants/colors';

export default function ChatListScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { 
    conversations, 
    isLoading, 
    error, 
    fetchConversations,
    setCurrentConversation
  } = useChatStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);
  
  const handleConversationPress = (conversationId: string) => {
    setCurrentConversation(conversationId);
    router.push(`/chat/${conversationId}`);
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this week, show day name
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };
  
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <MessageSquare size={60} color={Colors.textLight} />
        <Text style={styles.authTitle}>Faça login para ver suas mensagens</Text>
        <Text style={styles.authText}>
          Entre na sua conta para ver e enviar mensagens aos anunciantes.
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
          Ocorreu um erro ao carregar as conversas. Tente novamente.
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchConversations()}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MessageSquare size={60} color={Colors.textLight} />
        <Text style={styles.emptyTitle}>Nenhuma mensagem</Text>
        <Text style={styles.emptyText}>
          Você ainda não tem conversas. Inicie uma conversa com um anunciante.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.conversationItem}
            onPress={() => handleConversationPress(item.id)}
          >
            <Image
              source={{ uri: item.participants[0]?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg' }}
              style={styles.avatar}
              contentFit="cover"
            />
            
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
            
            <View style={styles.conversationInfo}>
              <View style={styles.conversationHeader}>
                <Text style={styles.participantName}>
                  {item.participants[0]?.name || 'Usuário'}
                </Text>
                <Text style={styles.timeText}>
                  {item.lastMessage ? formatTime(item.lastMessage.createdAt) : ''}
                </Text>
              </View>
              
              {item.lastMessage && (
                <Text 
                  style={[
                    styles.lastMessage,
                    item.unreadCount > 0 && styles.unreadMessage
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessage.content}
                </Text>
              )}
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
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  unreadBadge: {
    position: 'absolute',
    top: 12,
    left: 46,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textLight,
  },
  unreadMessage: {
    fontWeight: '600',
    color: Colors.text,
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