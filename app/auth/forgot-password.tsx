import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { authService } from '@/services/authService';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const validateForm = () => {
    if (!email.trim()) {
      setError('Email é obrigatório');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const success = await authService.resetPassword(email);
      
      if (success) {
        setIsSuccess(true);
      } else {
        setError('Não foi possível enviar o email de recuperação. Tente novamente.');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Email not found') {
        setError('Email não encontrado. Verifique e tente novamente.');
      } else {
        setError('Ocorreu um erro. Tente novamente mais tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircle size={80} color={Colors.success} />
          <Text style={styles.successTitle}>Email Enviado!</Text>
          <Text style={styles.successText}>
            Enviamos instruções para recuperar sua senha para {email}. Verifique sua caixa de entrada.
          </Text>
          <Button
            title="Voltar para Login"
            onPress={() => router.push('/auth/login')}
            style={styles.backToLoginButton}
          />
        </View>
      </View>
    );
  }
  
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
      
      <Text style={styles.title}>Recuperar Senha</Text>
      <Text style={styles.subtitle}>
        Informe seu email para receber instruções de recuperação de senha
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
        />
        
        <Button
          title="Enviar Instruções"
          onPress={handleResetPassword}
          loading={isLoading}
          style={styles.submitButton}
        />
      </View>
      
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Lembrou sua senha?</Text>
        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.loginLink}>Voltar para Login</Text>
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
  submitButton: {
    marginTop: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  backToLoginButton: {
    width: '100%',
  },
});