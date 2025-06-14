import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, MapPin, Plus, Trash2 } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { usePropertyStore } from '@/store/propertyStore';
import { propertyTypes, listingTypes } from '@/constants/propertyTypes';
import { provinces, cities } from '@/constants/locations';
import { PropertyType, ListingType, Amenity } from '@/types/property';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

export default function AddPropertyScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { addProperty, isLoading } = usePropertyStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType | ''>('');
  const [listingType, setListingType] = useState<ListingType | ''>('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>Faça login para publicar</Text>
        <Text style={styles.authText}>
          É necessário ter uma conta para publicar imóveis.
        </Text>
        <Button 
          title="Entrar" 
          onPress={() => router.push('/auth/login')} 
          style={styles.authButton}
        />
      </View>
    );
  }
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };
  
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'Título é obrigatório';
    if (!description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!price.trim()) newErrors.price = 'Preço é obrigatório';
    if (!propertyType) newErrors.propertyType = 'Tipo de imóvel é obrigatório';
    if (!listingType) newErrors.listingType = 'Tipo de anúncio é obrigatório';
    if (!area.trim()) newErrors.area = 'Área é obrigatória';
    if (!province) newErrors.province = 'Província é obrigatória';
    if (!city) newErrors.city = 'Cidade é obrigatória';
    if (images.length === 0) newErrors.images = 'Pelo menos uma imagem é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      // In a real app, we would upload images to a server and get URLs
      // For now, we'll just use the local URIs
      const mockImageUrls = images.length > 0 
        ? images 
        : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500'];
      
      await addProperty({
        title,
        description,
        price: Number(price),
        currency: 'MZN',
        type: propertyType as PropertyType,
        listingType: listingType as ListingType,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        area: Number(area),
        location: {
          province,
          city,
          neighborhood,
          coordinates: {
            latitude: -25.9692,
            longitude: 32.5732
          }
        },
        amenities: [],
        images: mockImageUrls,
        owner: {
          id: user?.id || '1',
          name: user?.name || 'Usuário',
          phone: user?.phone || '+258 84 123 4567',
          isPremium: user?.role === 'premium'
        },
        featured: user?.role === 'premium'
      });
      
      Alert.alert(
        'Sucesso',
        'Imóvel publicado com sucesso!',
        [{ text: 'OK', onPress: () => router.push('/') }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao publicar o imóvel.');
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Publicar Imóvel</Text>
      <Text style={styles.subtitle}>
        Preencha os detalhes do seu imóvel para publicar
      </Text>
      
      {/* Images */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fotos</Text>
        <Text style={styles.sectionSubtitle}>
          Adicione até 10 fotos do seu imóvel
        </Text>
        
        <View style={styles.imagesContainer}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image
                source={{ uri: image }}
                style={styles.image}
                contentFit="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Trash2 size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
          
          {images.length < 10 && (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={pickImage}
            >
              <Camera size={24} color={Colors.primary} />
              <Text style={styles.addImageText}>Adicionar</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {errors.images && (
          <Text style={styles.errorText}>{errors.images}</Text>
        )}
      </View>
      
      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Básicas</Text>
        
        <Input
          label="Título"
          placeholder="Ex: Apartamento T3 na Polana"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
        />
        
        <Input
          label="Descrição"
          placeholder="Descreva o seu imóvel..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={styles.textArea}
          error={errors.description}
        />
        
        <Input
          label="Preço (MZN)"
          placeholder="Ex: 5000000"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          error={errors.price}
        />
        
        <Text style={styles.label}>Tipo de Imóvel</Text>
        <View style={styles.optionsContainer}>
          {propertyTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionButton,
                propertyType === type.id && styles.selectedOption
              ]}
              onPress={() => setPropertyType(type.id as PropertyType)}
            >
              <Text
                style={[
                  styles.optionText,
                  propertyType === type.id && styles.selectedOptionText
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.propertyType && (
          <Text style={styles.errorText}>{errors.propertyType}</Text>
        )}
        
        <Text style={styles.label}>Tipo de Anúncio</Text>
        <View style={styles.optionsContainer}>
          {listingTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionButton,
                listingType === type.id && styles.selectedOption
              ]}
              onPress={() => setListingType(type.id as ListingType)}
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
        {errors.listingType && (
          <Text style={styles.errorText}>{errors.listingType}</Text>
        )}
      </View>
      
      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalhes</Text>
        
        <View style={styles.row}>
          <Input
            label="Quartos"
            placeholder="Ex: 3"
            value={bedrooms}
            onChangeText={setBedrooms}
            keyboardType="numeric"
            containerStyle={styles.halfInput}
          />
          
          <Input
            label="Casas de Banho"
            placeholder="Ex: 2"
            value={bathrooms}
            onChangeText={setBathrooms}
            keyboardType="numeric"
            containerStyle={styles.halfInput}
          />
        </View>
        
        <Input
          label="Área (m²)"
          placeholder="Ex: 120"
          value={area}
          onChangeText={setArea}
          keyboardType="numeric"
          error={errors.area}
        />
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
                setProvince(prov.id);
                setCity('');
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
        {errors.province && (
          <Text style={styles.errorText}>{errors.province}</Text>
        )}
        
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
                  onPress={() => setCity(cityItem.id)}
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
            {errors.city && (
              <Text style={styles.errorText}>{errors.city}</Text>
            )}
          </>
        )}
        
        <Input
          label="Bairro"
          placeholder="Ex: Polana"
          value={neighborhood}
          onChangeText={setNeighborhood}
          leftIcon={<MapPin size={20} color={Colors.textLight} />}
        />
      </View>
      
      {/* Submit Button */}
      <Button
        title="Publicar Imóvel"
        onPress={handleSubmit}
        loading={isLoading}
        style={styles.submitButton}
      />
      
      {/* Premium Upgrade Banner */}
      {user?.role !== 'premium' && (
        <View style={styles.premiumBanner}>
          <Text style={styles.premiumTitle}>Aumente a visibilidade!</Text>
          <Text style={styles.premiumText}>
            Torne-se Premium para destacar seus imóveis e publicar ilimitadamente.
          </Text>
          <Button
            title="Tornar-se Premium"
            variant="secondary"
            onPress={() => router.push('/premium')}
            style={styles.premiumButton}
          />
        </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  addImageText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
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
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  premiumBanner: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.premium,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  premiumText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  premiumButton: {
    backgroundColor: Colors.premium,
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
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: -8,
    marginBottom: 8,
  },
});