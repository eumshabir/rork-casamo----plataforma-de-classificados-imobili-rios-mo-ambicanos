import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { User, Mail, Phone, Camera, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser, isLoading } = useAuthStore();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleUpdateProfile = async () => {
    if (!validateForm()) return;
    
    try {
      await updateUser({
        name,
        email,
        phone,
        avatar
      });
      
      Alert.alert(
        'Perfil Atualizado',
        'Suas informações foram atualizadas com sucesso.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    }
  };
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };
  
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Editar Perfil</Text>
      </View>
      
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <User size={40} color={Colors.textLight} />
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.changeAvatarButton}
          onPress={pickImage}
        >
          <Camera size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.form}>
        <Input
          label="Nome Completo"
          placeholder="Seu nome"
          value={name}
          onChangeText={setName}
          leftIcon={<User size={20} color={Colors.textLight} />}
          error={errors.name}
        />
        
        <Input
          label="Email"
          placeholder="Seu email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Mail size={20} color={Colors.textLight} />}
          error={errors.email}
        />
        
        <Input
          label="Telefone"
          placeholder="+258 84 123 4567"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          leftIcon={<Phone size={20} color={Colors.textLight} />}
          error={errors.phone}
        />
        
        <Button
          title="Salvar Alterações"
          onPress={handleUpdateProfile}
          loading={isLoading}
          style={styles.saveButton}
        />
      </View>
      
      {user.role === 'premium' && (
        <View style={styles.premiumInfo}>
          <Text style={styles.premiumTitle}>Conta Premium</Text>
          <Text style={styles.premiumText}>
            Sua assinatura premium é válida até{' '}
            {new Date(user.premiumUntil || '').toLocaleDateString('pt-BR')}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  form: {
    marginBottom: 24,
  },
  saveButton: {
    marginTop: 16,
  },
  premiumInfo: {
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
  },
});