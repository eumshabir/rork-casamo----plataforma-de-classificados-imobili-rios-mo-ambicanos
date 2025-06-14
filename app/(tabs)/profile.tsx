import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  LogOut, 
  User, 
  Home, 
  Heart, 
  Settings, 
  CreditCard,
  HelpCircle,
  ChevronRight,
  Crown
} from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { usePropertyStore } from '@/store/propertyStore';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { userProperties, fetchUserProperties } = usePropertyStore();
  
  React.useEffect(() => {
    if (isAuthenticated) {
      fetchUserProperties();
    }
  }, [isAuthenticated]);
  
  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          onPress: () => {
            logout();
            router.replace('/');
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  // If user is not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>Bem-vindo ao CasaMoç</Text>
        <Text style={styles.authText}>
          Faça login ou crie uma conta para publicar imóveis, salvar favoritos e muito mais.
        </Text>
        <Button 
          title="Entrar" 
          onPress={() => router.push('/auth/login')} 
          style={styles.authButton}
        />
        <Button 
          title="Criar Conta" 
          variant="outline"
          onPress={() => router.push('/auth/register')} 
          style={styles.registerButton}
        />
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* User Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color={Colors.textLight} />
              </View>
            )}
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            
            {user?.role === 'premium' ? (
              <View style={styles.premiumBadge}>
                <Crown size={14} color="white" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.upgradeBadge}
                onPress={() => router.push('/premium')}
              >
                <Text style={styles.upgradeText}>Tornar-se Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push('/profile/edit')}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>
      
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userProperties.length}</Text>
          <Text style={styles.statLabel}>Imóveis</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {userProperties.reduce((sum, prop) => sum + prop.views, 0)}
          </Text>
          <Text style={styles.statLabel}>Visualizações</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.floor(Math.random() * 50)}
          </Text>
          <Text style={styles.statLabel}>Contatos</Text>
        </View>
      </View>
      
      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/properties')}
        >
          <View style={styles.menuIconContainer}>
            <Home size={20} color={Colors.primary} />
          </View>
          <Text style={styles.menuText}>Meus Imóveis</Text>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/favorites')}
        >
          <View style={styles.menuIconContainer}>
            <Heart size={20} color={Colors.primary} />
          </View>
          <Text style={styles.menuText}>Favoritos</Text>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        {user?.role === 'premium' && (
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/subscription')}
          >
            <View style={styles.menuIconContainer}>
              <Crown size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Minha Assinatura</Text>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/payments')}
        >
          <View style={styles.menuIconContainer}>
            <CreditCard size={20} color={Colors.primary} />
          </View>
          <Text style={styles.menuText}>Pagamentos</Text>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/settings')}
        >
          <View style={styles.menuIconContainer}>
            <Settings size={20} color={Colors.primary} />
          </View>
          <Text style={styles.menuText}>Configurações</Text>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/help')}
        >
          <View style={styles.menuIconContainer}>
            <HelpCircle size={20} color={Colors.primary} />
          </View>
          <Text style={styles.menuText}>Ajuda e Suporte</Text>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>
      
      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <LogOut size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
      
      <Text style={styles.versionText}>CasaMoç v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.premium,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  premiumText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  upgradeBadge: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  upgradeText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.border,
  },
  menuContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    marginBottom: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.textLight,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  authText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    width: '100%',
    marginBottom: 12,
  },
  registerButton: {
    width: '100%',
  },
});