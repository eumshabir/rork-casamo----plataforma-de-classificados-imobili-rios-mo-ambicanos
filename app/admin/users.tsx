import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, UserCheck, UserX, Filter } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

export default function AdminUsersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [premiumDuration, setPremiumDuration] = useState(30); // Default 30 days
  
  // Fetch users
  const { 
    data: usersData, 
    isLoading, 
    error, 
    refetch 
  } = trpc.user.getUsers.useQuery({
    limit: 50,
    isAdmin: true,
    role: selectedRole as any || undefined
  });
  
  // Set user as premium mutation
  const setPremiumMutation = trpc.user.setPremium.useMutation({
    onSuccess: () => {
      Alert.alert('Sucesso', 'Usuário atualizado para premium com sucesso!');
      refetch();
    },
    onError: (error) => {
      Alert.alert('Erro', `Falha ao atualizar usuário: ${error.message}`);
    }
  });
  
  // Filter users based on search query
  const filteredUsers = usersData?.users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  ) || [];
  
  const handleSetPremium = (userId: string) => {
    setSelectedUser(userId);
    
    Alert.alert(
      'Definir como Premium',
      `Escolha a duração do plano premium:`,
      [
        {
          text: '30 dias',
          onPress: () => confirmSetPremium(userId, 30),
        },
        {
          text: '90 dias',
          onPress: () => confirmSetPremium(userId, 90),
        },
        {
          text: '365 dias',
          onPress: () => confirmSetPremium(userId, 365),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setSelectedUser(null),
        },
      ]
    );
  };
  
  const confirmSetPremium = (userId: string, duration: number) => {
    setPremiumMutation.mutate({
      userId,
      duration,
      isAdmin: true
    });
    setSelectedUser(null);
  };
  
  const renderUserItem = ({ item }: { item: any }) => {
    const isPremium = item.role === 'premium';
    const premiumExpiry = item.premiumUntil 
      ? new Date(item.premiumUntil).toLocaleDateString() 
      : null;
    
    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userPhone}>{item.phone}</Text>
          
          <View style={styles.userStatusContainer}>
            <View style={[
              styles.userRoleBadge,
              isPremium ? styles.premiumBadge : styles.regularBadge
            ]}>
              <Text style={styles.userRoleText}>
                {isPremium ? 'Premium' : 'Regular'}
              </Text>
            </View>
            
            {isPremium && premiumExpiry && (
              <Text style={styles.expiryText}>
                Expira em: {premiumExpiry}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.userActions}>
          {!isPremium ? (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleSetPremium(item.id)}
              disabled={setPremiumMutation.isLoading && selectedUser === item.id}
            >
              {setPremiumMutation.isLoading && selectedUser === item.id ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <UserCheck size={16} color="white" />
                  <Text style={styles.actionButtonText}>Premium</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.alreadyPremium}>
              <UserCheck size={16} color={Colors.success} />
              <Text style={styles.alreadyPremiumText}>Premium</Text>
            </View>
          )}
        </View>
      </View>
    );
  };
  
  const renderRoleFilter = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity 
        style={[
          styles.filterButton,
          selectedRole === null && styles.activeFilter
        ]}
        onPress={() => setSelectedRole(null)}
      >
        <Text style={[
          styles.filterText,
          selectedRole === null && styles.activeFilterText
        ]}>
          Todos
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.filterButton,
          selectedRole === 'user' && styles.activeFilter
        ]}
        onPress={() => setSelectedRole('user')}
      >
        <Text style={[
          styles.filterText,
          selectedRole === 'user' && styles.activeFilterText
        ]}>
          Regular
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.filterButton,
          selectedRole === 'premium' && styles.activeFilter
        ]}
        onPress={() => setSelectedRole('premium')}
      >
        <Text style={[
          styles.filterText,
          selectedRole === 'premium' && styles.activeFilterText
        ]}>
          Premium
        </Text>
      </TouchableOpacity>
    </View>
  );
  
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
          Ocorreu um erro ao carregar os usuários.
        </Text>
        <Button 
          title="Tentar Novamente" 
          onPress={() => refetch()} 
          style={styles.retryButton}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Gerenciar Usuários</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuários..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      {renderRoleFilter()}
      
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.usersList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Nenhum usuário encontrado para esta busca.' 
                : 'Nenhum usuário disponível.'}
            </Text>
          </View>
        }
      />
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilter: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text,
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '600',
  },
  usersList: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  userStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  premiumBadge: {
    backgroundColor: Colors.success + '20',
  },
  regularBadge: {
    backgroundColor: Colors.textLight + '20',
  },
  userRoleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  expiryText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  userActions: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  alreadyPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alreadyPremiumText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '600',
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
    width: 200,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
});