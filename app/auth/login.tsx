import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SocialLoginButton from '@/components/SocialLoginButton';
import Colors from '@/constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle, loginWithFacebook, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Clear any previous auth errors when component mounts
    clearError();
  }, []);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      await login(email, password);
      router.replace('/');
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
  
  // For demo purposes, add a quick login option
  const handleDemoLogin = async () => {
    setEmail('joao@example.com');
    setPassword('password123');
    
    setTimeout(async () => {
      try {
        await login('joao@example.com', 'password123');
        router.replace('/');
      } catch (error) {
        // Error is already handled in the store
      }
    }, 500);
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
      
      <Text style={styles.title}>Bem-vindo de volta</Text>
      <Text style={styles.subtitle}>
        Faça login para acessar sua conta
      </Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.form}>
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
          label="Senha"
          placeholder="Sua senha"
          value={password}
          onChangeText={setPassword}
          isPassword
          leftIcon={<Lock size={20} color={Colors.textLight} />}
          error={errors.password}
        />
        
        <TouchableOpacity 
          style={styles.forgotPasswordButton}
          onPress={() => router.push('/auth/forgot-password')}
        >
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>
        
        <Button
          title="Entrar"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.loginButton}
        />
        
        <TouchableOpacity 
          style={styles.demoLoginButton}
          onPress={handleDemoLogin}
        >
          <Text style={styles.demoLoginText}>Entrar com conta demo</Text>
        </TouchableOpacity>
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
      
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Não tem uma conta?</Text>
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.registerLink}>Criar conta</Text>
        </TouchableOpacity>
      </View>
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 16,
  },
  demoLoginButton: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  demoLoginText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 16,
    color: Colors.textLight,
    marginRight: 4,
  },
  registerLink: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});