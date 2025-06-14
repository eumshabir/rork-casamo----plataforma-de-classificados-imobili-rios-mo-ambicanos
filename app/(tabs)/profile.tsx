import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  User, 
  Home, 
  CreditCard, 
  LogOut, 
  ChevronRight,
  Settings,
  Bell,
  MessageSquare,
  HelpCircle,
  Crown,
  Shield
} from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated]);
  
  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: () => {
            logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };
  
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }
  
  const isPremium = user.role === 'premium';
  const isAdmin = user.role === 'admin';
  
  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <View style={styles.userInfoContainer}>
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Crown size={14} color="white" />
            </View>
          )}
          
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Shield size={14} color="white" />
            </View>
          )}
        </View>
        
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        
        {isPremium && user.premiumUntil && (
          <View style={styles.premiumContainer}>
            <Crown size={16} color={Colors.primary} />
            <Text style={styles.premiumText}>
              Premium até {new Date(user.premiumUntil).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => router.push('/profile/edit')}
        >
          <Text style={styles.editProfileButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>
      
      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuSectionTitle}>Minha Conta</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/properties')}
        >
          <View style={styles.menuItemLeft}>
            <Home size={24} color={Colors.primary} />
            <Text style={styles.menuItemText}>Meus Imóveis</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/chat')}
        >
          <View style={styles.menuItemLeft}>
            <MessageSquare size={24} color={Colors.primary} />
            <Text style={styles.menuItemText}>Mensagens</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/notifications')}
        >
          <View style={styles.menuItemLeft}>
            <Bell size={24} color={Colors.primary} />
            <Text style={styles.menuItemText}>Notificações</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        {!isPremium && (
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/premium')}
          >
            <View style={styles.menuItemLeft}>
              <Crown size={24} color={Colors.primary} />
              <Text style={styles.menuItemText}>Tornar-se Premium</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        )}
        
        {isPremium && (
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/subscription')}
          >
            <View style={styles.menuItemLeft}>
              <Crown size={24} color={Colors.primary} />
              <Text style={styles.menuItemText}>Assinatura Premium</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/payments')}
        >
          <View style={styles.menuItemLeft}>
            <CreditCard size={24} color={Colors.primary} />
            <Text style={styles.menuItemText}>Histórico de Pagamentos</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        {isAdmin && (
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/admin')}
          >
            <View style={styles.menuItemLeft}>
              <Shield size={24} color={Colors.primary} />
              <Text style={styles.menuItemText}>Administração</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        )}
        
        <Text style={[styles.menuSectionTitle, styles.menuSectionTitleSpaced]}>
          Suporte
        </Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/help')}
        >
          <View style={styles.menuItemLeft}>
            <HelpCircle size={24} color={Colors.primary} />
            <Text style={styles.menuItemText}>Ajuda e Suporte</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {/* Open settings */}}
        >
          <View style={styles.menuItemLeft}>
            <Settings size={24} color={Colors.primary} />
            <Text style={styles.menuItemText}>Configurações</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <View style={styles.menuItemLeft}>
            <LogOut size={24} color={Colors.error} />
            <Text style={[styles.menuItemText, styles.logoutText]}>
              Sair da Conta
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoContainer: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 8,
  },
  premiumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 6,
  },
  premiumText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  editProfileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  menuContainer: {
    padding: 16,
  },
  menuSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  menuSectionTitleSpaced: {
    marginTop: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  logoutText: {
    color: Colors.error,
  },
});