import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { usePropertyStore } from '@/store/propertyStore';
import { propertyTypes } from '@/constants/propertyTypes';
import SearchBar from '@/components/SearchBar';
import CategoryPills from '@/components/CategoryPills';
import PropertyCard from '@/components/PropertyCard';
import Colors from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { 
    featuredProperties, 
    properties, 
    fetchFeaturedProperties, 
    fetchProperties, 
    setFilter 
  } = usePropertyStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    fetchFeaturedProperties();
    fetchProperties();
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchFeaturedProperties(), fetchProperties()]);
    setRefreshing(false);
  };
  
  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setFilter({});
    } else {
      setSelectedCategory(categoryId);
      setFilter({ type: categoryId as any });
    }
  };
  
  const navigateToSearch = () => {
    router.push('/search');
  };
  
  const navigateToFilter = () => {
    router.push('/filter');
  };
  
  const navigateToAllProperties = () => {
    router.push('/search');
  };

  const renderFeaturedItem = ({ item }: { item: any }) => (
    <PropertyCard property={item} horizontal={true} />
  );

  const renderRecentItem = ({ item }: { item: any }) => (
    <PropertyCard property={item} />
  );

  return (
    <FlatList
      data={[{ key: 'content' }]}
      renderItem={() => (
        <View style={styles.container}>
          {/* Header Banner */}
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.banner}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>CasaMoç</Text>
              <Text style={styles.bannerSubtitle}>
                Encontre o imóvel dos seus sonhos em Moçambique
              </Text>
            </View>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500' }}
              style={styles.bannerImage}
              contentFit="cover"
            />
          </LinearGradient>
          
          {/* Search Bar */}
          <SearchBar 
            onSearch={navigateToSearch} 
            onFilterPress={navigateToFilter} 
          />
          
          {/* Property Types */}
          <Text style={styles.sectionTitle}>Tipo de Imóvel</Text>
          <CategoryPills
            categories={propertyTypes}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
          
          {/* Featured Properties */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Destaques</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={navigateToAllProperties}
            >
              <Text style={styles.seeAllText}>Ver todos</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {featuredProperties.length > 0 ? (
            <FlatList
              data={featuredProperties}
              renderItem={renderFeaturedItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Nenhum imóvel em destaque</Text>
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum imóvel em destaque</Text>
            </View>
          )}
          
          {/* Recent Properties */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recentes</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={navigateToAllProperties}
            >
              <Text style={styles.seeAllText}>Ver todos</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {properties.slice(0, 5).length > 0 ? (
            <View style={styles.recentPropertiesContainer}>
              {properties.slice(0, 5).map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum imóvel recente encontrado</Text>
            </View>
          )}
        </View>
      )}
      keyExtractor={() => 'main'}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingBottom: 24,
  },
  banner: {
    height: 180,
    borderRadius: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
    padding: 20,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  bannerImage: {
    width: '40%',
    height: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    color: Colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  horizontalListContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recentPropertiesContainer: {
    paddingHorizontal: 16,
    gap: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
});