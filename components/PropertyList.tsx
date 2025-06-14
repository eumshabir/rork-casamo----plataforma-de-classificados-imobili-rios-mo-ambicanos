import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import PropertyCard from './PropertyCard';
import { Property } from '@/types/property';
import Colors from '@/constants/colors';

interface PropertyListProps {
  properties: Property[];
  isLoading?: boolean;
  horizontal?: boolean;
  title?: string;
  emptyMessage?: string;
}

export default function PropertyList({
  properties,
  isLoading = false,
  horizontal = false,
  title,
  emptyMessage = "Nenhum imóvel encontrado"
}: PropertyListProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Property }) => (
    <PropertyCard property={item} horizontal={!horizontal} />
  );

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      {properties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          horizontal={horizontal}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            horizontal ? styles.horizontalListContent : styles.verticalListContent
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 16,
    color: Colors.text,
  },
  listContent: {
    paddingBottom: 16,
  },
  horizontalListContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  verticalListContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
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