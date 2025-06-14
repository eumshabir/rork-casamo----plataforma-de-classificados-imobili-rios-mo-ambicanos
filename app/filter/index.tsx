import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, X } from 'lucide-react-native';
import { usePropertyStore } from '@/store/propertyStore';
import { propertyTypes, listingTypes, amenities } from '@/constants/propertyTypes';
import { provinces, cities } from '@/constants/locations';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Colors from '@/constants/colors';
import { PropertyType, ListingType, Amenity } from '@/types/property';

export default function FilterScreen() {
  const router = useRouter();
  const { filter, setFilter } = usePropertyStore();
  
  // Initialize state with current filter values
  const [type, setType] = useState<PropertyType | undefined>(filter.type);
  const [listingType, setListingType] = useState<ListingType | undefined>(filter.listingType);
  const [province, setProvince] = useState<string | undefined>(filter.province);
  const [city, setCity] = useState<string | undefined>(filter.city);
  const [minPrice, setMinPrice] = useState(filter.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(filter.maxPrice?.toString() || '');
  const [minBedrooms, setMinBedrooms] = useState(filter.minBedrooms?.toString() || '');
  const [minBathrooms, setMinBathrooms] = useState(filter.minBathrooms?.toString() || '');
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>(
    filter.amenities || []
  );
  
  const handleAmenityToggle = (amenityId: Amenity) => {
    if (selectedAmenities.includes(amenityId)) {
      setSelectedAmenities(selectedAmenities.filter(id => id !== amenityId));
    } else {
      setSelectedAmenities([...selectedAmenities, amenityId]);
    }
  };
  
  const handleApplyFilters = () => {
    const newFilter = {
      type,
      listingType,
      province,
      city,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minBedrooms: minBedrooms ? Number(minBedrooms) : undefined,
      minBathrooms: minBathrooms ? Number(minBathrooms) : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined
    };
    
    setFilter(newFilter);
    router.back();
  };
  
  const handleClearFilters = () => {
    setType(undefined);
    setListingType(undefined);
    setProvince(undefined);
    setCity(undefined);
    setMinPrice('');
    setMaxPrice('');
    setMinBedrooms('');
    setMinBathrooms('');
    setSelectedAmenities([]);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Filtros</Text>
        
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClearFilters}
        >
          <Text style={styles.clearButtonText}>Limpar</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Property Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Imóvel</Text>
          <View style={styles.optionsContainer}>
            {propertyTypes.map((propertyType) => (
              <TouchableOpacity
                key={propertyType.id}
                style={[
                  styles.optionButton,
                  type === propertyType.id && styles.selectedOption
                ]}
                onPress={() => setType(
                  type === propertyType.id as PropertyType ? undefined : propertyType.id as PropertyType
                )}
              >
                <Text
                  style={[
                    styles.optionText,
                    type === propertyType.id && styles.selectedOptionText
                  ]}
                >
                  {propertyType.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Listing Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Anúncio</Text>
          <View style={styles.optionsContainer}>
            {listingTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.optionButton,
                  listingType === type.id && styles.selectedOption
                ]}
                onPress={() => setListingType(
                  listingType === type.id as ListingType ? undefined : type.id as ListingType
                )}
              >
                <Text
                  style={[
                    styles.optionText,
                    listingType === type.id && styles.selectedOptionText
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização</Text>
          
          <Text style={styles.label}>Província</Text>
          <View style={styles.optionsContainer}>
            {provinces.slice(0, 3).map((prov) => (
              <TouchableOpacity
                key={prov.id}
                style={[
                  styles.optionButton,
                  province === prov.id && styles.selectedOption
                ]}
                onPress={() => {
                  if (province === prov.id) {
                    setProvince(undefined);
                    setCity(undefined);
                  } else {
                    setProvince(prov.id);
                    setCity(undefined);
                  }
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    province === prov.id && styles.selectedOptionText
                  ]}
                >
                  {prov.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {province && (
            <>
              <Text style={styles.label}>Cidade</Text>
              <View style={styles.optionsContainer}>
                {cities[province as keyof typeof cities]?.map((cityItem) => (
                  <TouchableOpacity
                    key={cityItem.id}
                    style={[
                      styles.optionButton,
                      city === cityItem.id && styles.selectedOption
                    ]}
                    onPress={() => setCity(
                      city === cityItem.id ? undefined : cityItem.id
                    )}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        city === cityItem.id && styles.selectedOptionText
                      ]}
                    >
                      {cityItem.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
        
        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preço</Text>
          <View style={styles.row}>
            <Input
              label="Mínimo (MZN)"
              placeholder="Ex: 1000000"
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="numeric"
              containerStyle={styles.halfInput}
            />
            
            <Input
              label="Máximo (MZN)"
              placeholder="Ex: 5000000"
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="numeric"
              containerStyle={styles.halfInput}
            />
          </View>
        </View>
        
        {/* Bedrooms & Bathrooms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quartos e Casas de Banho</Text>
          <View style={styles.row}>
            <Input
              label="Quartos (mín.)"
              placeholder="Ex: 2"
              value={minBedrooms}
              onChangeText={setMinBedrooms}
              keyboardType="numeric"
              containerStyle={styles.halfInput}
            />
            
            <Input
              label="Casas de Banho (mín.)"
              placeholder="Ex: 1"
              value={minBathrooms}
              onChangeText={setMinBathrooms}
              keyboardType="numeric"
              containerStyle={styles.halfInput}
            />
          </View>
        </View>
        
        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comodidades</Text>
          <View style={styles.amenitiesContainer}>
            {amenities.map((amenity) => (
              <View key={amenity.id} style={styles.amenityItem}>
                <Text style={styles.amenityLabel}>{amenity.label}</Text>
                <Switch
                  value={selectedAmenities.includes(amenity.id as Amenity)}
                  onValueChange={() => handleAmenityToggle(amenity.id as Amenity)}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor={selectedAmenities.includes(amenity.id as Amenity) ? Colors.primary : '#f4f3f4'}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Aplicar Filtros"
          onPress={handleApplyFilters}
          style={styles.applyButton}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectedOptionText: {
    color: 'white',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  amenitiesContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amenityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  amenityLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applyButton: {
    width: '100%',
  },
});