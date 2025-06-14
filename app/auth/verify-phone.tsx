import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { authService } from '@/services/authService';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  useEffect(() => {
    // Start countdown
    if (countdown > 0 && !isVerified) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isVerified]);
  
  const handleCodeChange = (text: string, index: number) => {
    // Update the code array
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all digits are entered
    if (index === 5 && text) {
      handleVerify();
    }
  };
  
  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Por favor, insira o código completo de 6 dígitos.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await authService.verifyPhone(phone || '', verificationCode);
      
      if (success) {
        setIsVerified(true);
        
        setTimeout(() => {
          router.replace('/');
        }, 2000);
      } else {
        setError('Código inválido. Por favor, tente novamente.');
      }
    } catch (error) {
      setError('Ocorreu um erro ao verificar o código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    setError(null);
    
    try {
      await authService.requestVerificationCode(phone || '');
      setCountdown(60);
      Alert.alert('Código Enviado', 'Um novo código foi enviado para o seu telefone.');
    } catch (error) {
      setError('Não foi possível enviar um novo código. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };
  
  if (isVerified) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircle size={80} color={Colors.success} />
          <Text style={styles.successTitle}>Verificado com Sucesso!</Text>
          <Text style={styles.successText}>
            Seu número de telefone foi verificado. Redirecionando...
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color={Colors.text} />
      </TouchableOpacity>
      
      <Text style={styles.title}>Verificar Telefone</Text>
      <Text style={styles.subtitle}>
        Enviamos um código de 6 dígitos para {phone}
      </Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref }}
            style={styles.codeInput}
            value={digit}
            onChangeText={text => handleCodeChange(text.replace(/[^0-9]/g, ''), index)}
            onKeyPress={e => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
            editable={!isLoading}
          />
        ))}
      </View>
      
      <Button
        title="Verificar"
        onPress={handleVerify}
        loading={isLoading}
        style={styles.verifyButton}
      />
      
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Não recebeu o código?</Text>
        {countdown > 0 ? (
          <Text style={styles.countdownText}>
            Reenviar em {countdown}s
          </Text>
        ) : (
          <TouchableOpacity 
            onPress={handleResendCode}
            disabled={isResending}
          >
            <Text style={styles.resendLink}>
              {isResending ? 'Enviando...' : 'Reenviar código'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  codeInput: {
    width: 45,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: Colors.card,
    color: Colors.text,
  },
  verifyButton: {
    marginBottom: 24,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  resendLink: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});