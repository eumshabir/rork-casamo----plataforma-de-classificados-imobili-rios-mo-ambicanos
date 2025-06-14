import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  Text,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Filter } from 'lucide-react-native';
import { usePropertyStore } from '@/store/propertyStore';
import { listingTypes } from '@/constants/propertyTypes';
import SearchBar from '@/components/SearchBar';
import PropertyCard from '@/components/PropertyCard';
import CategoryPills from '@/components/CategoryPills';
import Colors from '@/constants/colors';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ query?: string }>();
  const { properties, isLoading, fetchProperties, setFilter } = usePropertyStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(params.query || '');
  const [selectedListingType, setSelectedListingType] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProperties();
  }, []);
  
  useEffect(() => {
    if (params.query) {
      setSearchQuery(params.query);
      handleSearch(params.query);
    }
  }, [params.query]);
  
  const handleSearch = (query: string) => {
    // In a real app, this would call an API with the search query
    // For now, we'll just log it
    console.log('Searching for:', query);
    fetchProperties();
  };
  
  const handleListingTypeSelect = (typeId: string) => {
    if (selectedListingType === typeId) {
      setSelectedListingType(null);
      setFilter({});
    } else {
      setSelectedListingType(typeId);
      setFilter({ listingType: typeId as any });
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  };
  
  const openFilters = () => {
    // Navigate to filters screen
    console.log('Open filters');
  };
  
  const renderItem = ({ item }: { item: any }) => (
    <PropertyCard property={item} />
  );
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Nenhum resultado encontrado</Text>
      <Text style={styles.emptyText}>
        Tente ajustar os seus filtros ou pesquisar por outros termos.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SearchBar 
        onSearch={handleSearch} 
        placeholder="Pesquisar por localização, tipo..."
        onFilterPress={openFilters}
      />
      
      <CategoryPills
        categories={listingTypes}
        selectedCategory={selectedListingType}
        onSelectCategory={handleListingTypeSelect}
      />
      
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {properties.length} imóveis encontrados
        </Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={openFilters}
        >
          <Filter size={16} color={Colors.text} />
          <Text style={styles.filterText}>Filtros</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});