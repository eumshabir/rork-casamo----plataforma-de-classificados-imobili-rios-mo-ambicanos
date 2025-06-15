import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
  Alert,
  Share,
  FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  Heart, 
  Share2, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react-native';
import { usePropertyStore } from '@/store/propertyStore';
import { Property } from '@/types/property';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    properties, 
    favoriteProperties, 
    toggleFavorite, 
    fetchProperties 
  } = usePropertyStore();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  
  useEffect(() => {
    if (!properties.length) {
      fetchProperties();
    }
  }, []);
  
  useEffect(() => {
    if (id && properties.length) {
      const foundProperty = properties.find(p => p.id === id);
      if (foundProperty) {
        setProperty(foundProperty);
        
        // Find similar properties (same type or location)
        const similar = properties.filter(p => 
          p.id !== id && 
          (p.type === foundProperty.type || 
           p.location.city === foundProperty.location.city)
        ).slice(0, 3);
        
        setSimilarProperties(similar);
      }
    }
  }, [id, properties]);
  
  if (!property) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }
  
  const isFavorite = favoriteProperties.includes(property.id);
  
  const handleFavoritePress = () => {
    toggleFavorite(property.id);
  };
  
  const handleSharePress = async () => {
    try {
      await Share.share({
        message: `Confira este imóvel no CasaMoç: ${property.title}`,
        url: `https://casamoc.com/property/${property.id}`,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar este imóvel.');
    }
  };
  
  const handleCallPress = () => {
    Linking.openURL(`tel:${property.owner.phone}`);
  };
  
  const handleWhatsAppPress = () => {
    const message = `Olá, estou interessado no imóvel "${property.title}" que vi no CasaMoç.`;
    const phone = property.owner.phone.replace(/\s+/g, '');
    
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`);
  };
  
  const nextImage = () => {
    if (currentImageIndex < property.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };
  
  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };
  
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const renderSimilarProperty = ({ item }: { item: Property }) => (
    <TouchableOpacity 
      style={styles.similarPropertyCard}
      onPress={() => router.push(`/property/${item.id}`)}
    >
      <Image
        source={{ uri: `${item.images[0]}?w=300` }}
        style={styles.similarPropertyImage}
        contentFit="cover"
      />
      <View style={styles.similarPropertyInfo}>
        <Text style={styles.similarPropertyPrice}>
          {formatPrice(item.price)} {item.currency}
        </Text>
        <Text style={styles.similarPropertyTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.similarPropertyLocation} numberOfLines={1}>
          {item.location.neighborhood}, {item.location.city === 'maputo_city' ? 'Maputo' : 'Matola'}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${property.images[currentImageIndex]}?w=800` }}
            style={styles.image}
            contentFit="cover"
          />
          
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1}/{property.images.length}
            </Text>
          </View>
          
          {currentImageIndex > 0 && (
            <TouchableOpacity 
              style={[styles.imageNavButton, styles.prevButton]}
              onPress={prevImage}
            >
              <ChevronLeft size={24} color="white" />
            </TouchableOpacity>
          )}
          
          {currentImageIndex < property.images.length - 1 && (
            <TouchableOpacity 
              style={[styles.imageNavButton, styles.nextButton]}
              onPress={nextImage}
            >
              <ChevronRight size={24} color="white" />
            </TouchableOpacity>
          )}
          
          <View style={styles.imageActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleFavoritePress}
            >
              <Heart 
                size={20} 
                color={isFavorite ? Colors.error : 'white'} 
                fill={isFavorite ? Colors.error : 'transparent'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleSharePress}
            >
              <Share2 size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {property.listingType === 'rent' && (
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>Arrendamento</Text>
            </View>
          )}
        </View>
        
        {/* Thumbnail Gallery */}
        {property.images.length > 1 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailContainer}
          >
            {property.images.map((image, index) => (
              <TouchableOpacity 
                key={index}
                onPress={() => setCurrentImageIndex(index)}
                style={[
                  styles.thumbnail,
                  currentImageIndex === index && styles.activeThumbnail
                ]}
              >
                <Image
                  source={{ uri: `${image}?w=200` }}
                  style={styles.thumbnailImage}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        <View style={styles.contentContainer}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.price}>
              {formatPrice(property.price)} {property.currency}
              {property.listingType === 'rent' && <Text style={styles.rentPeriod}>/mês</Text>}
            </Text>
            
            <Text style={styles.title}>{property.title}</Text>
            
            <View style={styles.locationContainer}>
              <MapPin size={16} color={Colors.textLight} />
              <Text style={styles.location}>
                {property.location.neighborhood}, {property.location.city === 'maputo_city' ? 'Maputo' : 'Matola'}
              </Text>
            </View>
            
            <View style={styles.featuresContainer}>
              {property.bedrooms && (
                <View style={styles.feature}>
                  <Bed size={20} color={Colors.primary} />
                  <Text style={styles.featureText}>{property.bedrooms} quartos</Text>
                </View>
              )}
              
              {property.bathrooms && (
                <View style={styles.feature}>
                  <Bath size={20} color={Colors.primary} />
                  <Text style={styles.featureText}>{property.bathrooms} WC</Text>
                </View>
              )}
              
              <View style={styles.feature}>
                <Square size={20} color={Colors.primary} />
                <Text style={styles.featureText}>{property.area} m²</Text>
              </View>
            </View>
          </View>
          
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>
          
          {/* Amenities */}
          {property.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Comodidades</Text>
              <View style={styles.amenitiesContainer}>
                {property.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Text style={styles.amenityText}>
                      {amenity === 'pool' && 'Piscina'}
                      {amenity === 'garage' && 'Garagem'}
                      {amenity === 'garden' && 'Jardim'}
                      {amenity === 'security' && 'Segurança'}
                      {amenity === 'furnished' && 'Mobilado'}
                      {amenity === 'aircon' && 'Ar Condicionado'}
                      {amenity === 'balcony' && 'Varanda'}
                      {amenity === 'elevator' && 'Elevador'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Owner Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Anunciante</Text>
            <View style={styles.ownerContainer}>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{property.owner.name}</Text>
                <Text style={styles.ownerType}>
                  {property.owner.isPremium ? 'Anunciante Premium' : 'Anunciante'}
                </Text>
              </View>
              
              <View style={styles.contactButtons}>
                <TouchableOpacity 
                  style={[styles.contactButton, styles.callButton]}
                  onPress={handleCallPress}
                >
                  <Phone size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.contactButton, styles.whatsappButton]}
                  onPress={handleWhatsAppPress}
                >
                  <MessageCircle size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Similar Properties */}
          {similarProperties.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Imóveis Semelhantes</Text>
              <FlatList
                data={similarProperties}
                renderItem={renderSimilarProperty}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarPropertiesContainer}
                nestedScrollEnabled={true}
              />
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.bottomPrice}>
            {formatPrice(property.price)} {property.currency}
          </Text>
          {property.listingType === 'rent' && (
            <Text style={styles.bottomRentPeriod}>/mês</Text>
          )}
        </View>
        
        <Button
          title="Contactar"
          onPress={handleWhatsAppPress}
          style={styles.contactActionButton}
        />
      </View>
    </View>
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
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButton: {
    left: 16,
  },
  nextButton: {
    right: 16,
  },
  imageActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: Colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  rentPeriod: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.textLight,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  location: {
    fontSize: 16,
    color: Colors.textLight,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityItem: {
    backgroundColor: Colors.primaryLight + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  ownerType: {
    fontSize: 14,
    color: Colors.textLight,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButton: {
    backgroundColor: Colors.primary,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  similarPropertiesContainer: {
    paddingVertical: 8,
    gap: 12,
  },
  similarPropertyCard: {
    width: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  similarPropertyImage: {
    width: '100%',
    height: 120,
  },
  similarPropertyInfo: {
    padding: 12,
  },
  similarPropertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  similarPropertyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  similarPropertyLocation: {
    fontSize: 12,
    color: Colors.textLight,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Platform.select({
      ios: {
        paddingBottom: 32,
      },
    }),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  bottomRentPeriod: {
    fontSize: 14,
    color: Colors.textLight,
  },
  contactActionButton: {
    flex: 1,
    maxWidth: 150,
  },
});