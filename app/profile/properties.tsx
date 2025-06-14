import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Edit, Trash2, Plus, Eye } from 'lucide-react-native';
import { Image } from 'expo-image';
import { usePropertyStore } from '@/store/propertyStore';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

export default function UserPropertiesScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { userProperties, fetchUserProperties, deleteProperty, isLoading } = usePropertyStore();
  
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProperties();
    }
  }, [isAuthenticated]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProperties();
    setRefreshing(false);
  };
  
  const handleAddProperty = () => {
    router.push('/add-property');
  };
  
  const handleEditProperty = (id: string) => {
    router.push(`/property/edit/${id}`);
  };
  
  const handleDeleteProperty = (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: async () => {
            try {
              await deleteProperty(id);
              Alert.alert('Sucesso', 'Imóvel excluído com sucesso.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o imóvel.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  const handleViewProperty = (id: string) => {
    router.push(`/property/${id}`);
  };
  
  // If user is not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>Faça login para ver seus imóveis</Text>
        <Text style={styles.authText}>
          É necessário ter uma conta para publicar e gerenciar imóveis.
        </Text>
        <Button 
          title="Entrar" 
          onPress={() => router.push('/auth/login')} 
          style={styles.authButton}
        />
      </View>
    );
  }
  
  const renderPropertyItem = ({ item }: { item: any }) => (
    <View style={styles.propertyCard}>
      <TouchableOpacity
        style={styles.propertyImageContainer}
        onPress={() => handleViewProperty(item.id)}
      >
        <Image
          source={{ uri: `${item.images[0]}?w=300` }}
          style={styles.propertyImage}
          contentFit="cover"
        />
        <View style={styles.propertyViews}>
          <Eye size={14} color="white" />
          <Text style={styles.propertyViewsText}>{item.views}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {item.title}
        </Text>
        
        <Text style={styles.propertyPrice}>
          {item.price.toLocaleString('pt-MZ')} {item.currency}
          {item.listingType === 'rent' && <Text style={styles.rentPeriod}>/mês</Text>}
        </Text>
        
        <Text style={styles.propertyLocation} numberOfLines={1}>
          {item.location.neighborhood}, {item.location.city === 'maputo_city' ? 'Maputo' : 'Matola'}
        </Text>
        
        <View style={styles.propertyActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleViewProperty(item.id)}
          >
            <Text style={styles.actionButtonText}>Ver</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditProperty(item.id)}
          >
            <Edit size={16} color={Colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProperty(item.id)}
          >
            <Trash2 size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Meus Imóveis</Text>
          <Text style={styles.subtitle}>
            {userProperties.length} imóveis publicados
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddProperty}
        >
          <Plus size={20} color="white" />
          <Text style={styles.addButtonText}>Publicar</Text>
        </TouchableOpacity>
      </View>
      
      {user?.role !== 'premium' && userProperties.length >= 2 && (
        <View style={styles.limitWarning}>
          <Text style={styles.limitWarningText}>
            Você atingiu o limite de 2 imóveis para contas gratuitas.
          </Text>
          <TouchableOpacity onPress={() => router.push('/premium')}>
            <Text style={styles.upgradeLink}>Torne-se Premium</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={userProperties}
        renderItem={renderPropertyItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nenhum imóvel publicado</Text>
            <Text style={styles.emptyText}>
              Publique seu primeiro imóvel para começar a receber contatos.
            </Text>
            <Button 
              title="Publicar Imóvel" 
              onPress={handleAddProperty}
              style={styles.emptyButton}
            />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  limitWarning: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  limitWarningText: {
    color: '#92400E',
    fontSize: 14,
    marginRight: 4,
  },
  upgradeLink: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  propertyCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    height: 120,
  },
  propertyImageContainer: {
    width: 120,
    height: '100%',
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  propertyViews: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  propertyViewsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  propertyInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  rentPeriod: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textLight,
  },
  propertyLocation: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  propertyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButton: {
    backgroundColor: Colors.primaryLight + '30',
  },
  actionButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: Colors.primaryLight + '30',
    width: 32,
    height: 32,
    borderRadius: 16,
    padding: 0,
  },
  deleteButton: {
    backgroundColor: Colors.error + '20',
    width: 32,
    height: 32,
    borderRadius: 16,
    padding: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    width: '100%',
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
  },
});