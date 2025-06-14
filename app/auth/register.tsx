import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SocialLoginButton from '@/components/SocialLoginButton';
import Colors from '@/constants/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loginWithGoogle, loginWithFacebook, isLoading, error, clearError } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Clear any previous auth errors when component mounts
    clearError();
  }, []);
  
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
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      await register({ name, email, phone }, password);
      Alert.alert(
        'Conta Criada',
        'Sua conta foi criada com sucesso!',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } catch (error) {
      // Error is already handled in the store
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.replace('/');
    } catch (error) {
      // Error is already handled in the store
    }
  };
  
  const handleFacebookLogin = async () => {
    try {
      await loginWithFacebook();
      router.replace('/');
    } catch (error) {
      // Error is already handled in the store
    }
  };
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color={Colors.text} />
      </TouchableOpacity>
      
      <Text style={styles.title}>Criar Conta</Text>
      <Text style={styles.subtitle}>
        Preencha os dados abaixo para criar sua conta
      </Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
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
        
        <Input
          label="Senha"
          placeholder="Crie uma senha"
          value={password}
          onChangeText={setPassword}
          isPassword
          leftIcon={<Lock size={20} color={Colors.textLight} />}
          error={errors.password}
        />
        
        <Input
          label="Confirmar Senha"
          placeholder="Confirme sua senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
          leftIcon={<Lock size={20} color={Colors.textLight} />}
          error={errors.confirmPassword}
        />
        
        <Button
          title="Criar Conta"
          onPress={handleRegister}
          loading={isLoading}
          style={styles.registerButton}
        />
      </View>
      
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.divider} />
      </View>
      
      <SocialLoginButton
        type="google"
        onPress={handleGoogleLogin}
        isLoading={isLoading}
      />
      
      <SocialLoginButton
        type="facebook"
        onPress={handleFacebookLogin}
        isLoading={isLoading}
      />
      
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Já tem uma conta?</Text>
        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.loginLink}>Entrar</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.termsText}>
        Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
  },
  form: {
    marginBottom: 24,
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    color: Colors.textLight,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  loginText: {
    fontSize: 16,
    color: Colors.textLight,
    marginRight: 4,
  },
  loginLink: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});