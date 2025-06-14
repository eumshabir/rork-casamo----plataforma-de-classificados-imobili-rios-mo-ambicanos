import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  RefreshControl
} from 'react-native';
import { usePropertyStore } from '@/store/propertyStore';
import { useAuthStore } from '@/store/authStore';
import PropertyList from '@/components/PropertyList';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';

export default function FavoritesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { 
    properties, 
    favoriteProperties, 
    isLoading, 
    fetchProperties 
  } = usePropertyStore();
  
  const [refreshing, setRefreshing] = React.useState(false);
  
  useEffect(() => {
    fetchProperties();
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  };
  
  // Filter properties to show only favorites
  const favoriteItems = properties.filter(property => 
    favoriteProperties.includes(property.id)
  );
  
  // If user is not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>Faça login para ver seus favoritos</Text>
        <Text style={styles.authText}>
          É necessário ter uma conta para salvar e visualizar imóveis favoritos.
        </Text>
        <Button 
          title="Entrar" 
          onPress={() => router.push('/auth/login')} 
          style={styles.authButton}
        />
      </View>
    );
  }
  
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Seus Favoritos</Text>
      
      {favoriteItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
          <Text style={styles.emptyText}>
            Adicione imóveis aos favoritos para encontrá-los facilmente depois.
          </Text>
          <Button 
            title="Explorar Imóveis" 
            onPress={() => router.push('/')}
            style={styles.exploreButton}
          />
        </View>
      ) : (
        <PropertyList 
          properties={favoriteItems} 
          isLoading={isLoading || refreshing}
          title={`${favoriteItems.length} imóveis salvos`}
        />
      )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
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
  exploreButton: {
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