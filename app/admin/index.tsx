import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Users, 
  Home, 
  MessageSquare, 
  Bell, 
  Settings,
  ArrowLeft,
  BarChart3,
  Shield
} from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function AdminDashboardScreen() {
  const router = useRouter();
  
  const adminMenuItems = [
    {
      title: 'Usuários',
      icon: <Users size={24} color={Colors.primary} />,
      description: 'Gerenciar usuários e contas premium',
      route: '/admin/users',
    },
    {
      title: 'Imóveis',
      icon: <Home size={24} color={Colors.primary} />,
      description: 'Gerenciar anúncios de imóveis',
      route: '/admin/properties',
    },
    {
      title: 'Mensagens',
      icon: <MessageSquare size={24} color={Colors.primary} />,
      description: 'Visualizar conversas e suporte',
      route: '/admin/messages',
    },
    {
      title: 'Notificações',
      icon: <Bell size={24} color={Colors.primary} />,
      description: 'Enviar notificações aos usuários',
      route: '/admin/notifications',
    },
    {
      title: 'Estatísticas',
      icon: <BarChart3 size={24} color={Colors.primary} />,
      description: 'Visualizar métricas e relatórios',
      route: '/admin/stats',
    },
    {
      title: 'Configurações',
      icon: <Settings size={24} color={Colors.primary} />,
      description: 'Configurações do sistema',
      route: '/admin/settings',
    },
  ];
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/')}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Painel de Administração</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.adminBadge}>
          <Shield size={20} color="white" />
          <Text style={styles.adminBadgeText}>Administrador</Text>
        </View>
        
        <Text style={styles.welcomeText}>
          Bem-vindo ao painel de administração do CasaMoç
        </Text>
        
        <View style={styles.menuGrid}>
          {adminMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.menuIconContainer}>
                {item.icon}
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    padding: 16,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 6,
  },
  adminBadgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 24,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  menuItem: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
});