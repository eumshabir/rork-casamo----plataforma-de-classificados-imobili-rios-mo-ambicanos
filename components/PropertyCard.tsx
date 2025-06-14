import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { Property } from '@/types/property';
import { usePropertyStore } from '@/store/propertyStore';
import Colors from '@/constants/colors';

interface PropertyCardProps {
  property: Property;
  horizontal?: boolean;
}

export default function PropertyCard({ property, horizontal = false }: PropertyCardProps) {
  const router = useRouter();
  const { favoriteProperties, toggleFavorite } = usePropertyStore();
  const isFavorite = favoriteProperties.includes(property.id);

  const handlePress = () => {
    router.push(`/property/${property.id}`);
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        horizontal ? styles.horizontalContainer : null,
        property.owner.isPremium ? styles.premiumContainer : null
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={[styles.imageContainer, horizontal ? styles.horizontalImageContainer : null]}>
        <Image
          source={{ uri: `${property.images[0]}?w=500` }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={handleFavoritePress}
          activeOpacity={0.8}
        >
          <Heart 
            size={20} 
            color={isFavorite ? Colors.error : 'white'} 
            fill={isFavorite ? Colors.error : 'transparent'} 
          />
        </TouchableOpacity>
        
        {property.listingType === 'rent' && (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>Arrendamento</Text>
          </View>
        )}
        
        {property.owner.isPremium && (
          <View style={styles.premiumTag}>
            <Text style={styles.premiumTagText}>Destaque</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.price}>
          {formatPrice(property.price)} {property.currency}
          {property.listingType === 'rent' && <Text style={styles.rentPeriod}>/mês</Text>}
        </Text>
        
        <Text style={styles.title} numberOfLines={2}>{property.title}</Text>
        
        <Text style={styles.location}>
          {property.location.neighborhood}, {property.location.city === 'maputo_city' ? 'Maputo' : 'Matola'}
        </Text>
        
        <View style={styles.detailsContainer}>
          {property.bedrooms && (
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>{property.bedrooms} quartos</Text>
            </View>
          )}
          
          {property.bathrooms && (
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>{property.bathrooms} WC</Text>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <Text style={styles.detailText}>{property.area} m²</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.9;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: cardWidth,
    marginBottom: 16,
  },
  horizontalContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 120,
  },
  premiumContainer: {
    borderWidth: 1,
    borderColor: Colors.premium,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  horizontalImageContainer: {
    width: 120,
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  premiumTag: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: Colors.premium,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  premiumTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 12,
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  rentPeriod: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textLight,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});