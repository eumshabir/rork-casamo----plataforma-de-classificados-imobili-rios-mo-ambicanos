import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { paymentService, PAYMENT_METHODS } from '@/services/paymentService';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    amount: string;
    planId?: string;
    planDuration?: string;
    description?: string;
  }>();
  
  const { user, upgradeToPremium } = useAuthStore();
  
  const [selectedMethod, setSelectedMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const amount = params.amount ? parseFloat(params.amount) : 0;
  const planDuration = params.planDuration ? parseInt(params.planDuration) : 0;
  const description = params.description || 'Pagamento CasaMoç';
  
  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Erro', 'Por favor, insira um número de telefone válido.');
      return;
    }
    
    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage(null);
    
    try {
      const paymentResponse = await paymentService.processPayment({
        amount,
        currency: 'MZN',
        method: selectedMethod,
        phoneNumber,
        description
      });
      
      if (paymentResponse.success && paymentResponse.transactionId) {
        setTransactionId(paymentResponse.transactionId);
        
        // Verify payment
        setIsVerifying(true);
        const verificationResponse = await paymentService.verifyPayment(paymentResponse.transactionId);
        
        if (verificationResponse.success) {
          setPaymentStatus('success');
          
          // If this is a premium plan purchase, update user status
          if (params.planId && planDuration > 0) {
            await upgradeToPremium(planDuration);
          }
          
          // Show success message and redirect
          setTimeout(() => {
            Alert.alert(
              'Pagamento Concluído',
              'Seu pagamento foi processado com sucesso!',
              [{ text: 'OK', onPress: () => router.replace('/') }]
            );
          }, 1000);
        } else {
          setPaymentStatus('failed');
          setErrorMessage(verificationResponse.message);
        }
      } else {
        setPaymentStatus('failed');
        setErrorMessage(paymentResponse.message);
      }
    } catch (error) {
      setPaymentStatus('failed');
      setErrorMessage('Ocorreu um erro ao processar o pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
      setIsVerifying(false);
    }
  };
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Pagamento</Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Valor a Pagar</Text>
        <Text style={styles.amount}>{amount.toLocaleString('pt-MZ')} MZN</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      
      {paymentStatus === 'success' ? (
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Check size={40} color="white" />
          </View>
          <Text style={styles.successTitle}>Pagamento Concluído</Text>
          <Text style={styles.successText}>
            Seu pagamento foi processado com sucesso!
          </Text>
          <Text style={styles.transactionId}>
            ID da Transação: {transactionId}
          </Text>
        </View>
      ) : paymentStatus === 'failed' ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <AlertCircle size={40} color="white" />
          </View>
          <Text style={styles.errorTitle}>Falha no Pagamento</Text>
          <Text style={styles.errorText}>
            {errorMessage || 'Ocorreu um erro ao processar o pagamento.'}
          </Text>
          <Button
            title="Tentar Novamente"
            onPress={handlePayment}
            style={styles.retryButton}
          />
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Método de Pagamento</Text>
          <View style={styles.paymentMethodsContainer}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedMethod === method.id && styles.selectedPaymentMethod
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <Image
                  source={{ uri: method.icon }}
                  style={styles.paymentMethodIcon}
                />
                <Text style={styles.paymentMethodName}>{method.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>Detalhes do Pagamento</Text>
          <Input
            label="Número de Telefone"
            placeholder="+258 84 123 4567"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          
          <Text style={styles.infoText}>
            Você receberá uma notificação no seu telefone para confirmar o pagamento.
          </Text>
          
          <Button
            title={isProcessing ? 'Processando...' : 'Pagar Agora'}
            onPress={handlePayment}
            loading={isProcessing || isVerifying}
            disabled={isProcessing || isVerifying}
            style={styles.payButton}
          />
          
          {isVerifying && (
            <View style={styles.verifyingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.verifyingText}>
                Verificando pagamento...
              </Text>
            </View>
          )}
        </>
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
    padding: 24,
    paddingBottom: 40,
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
  amountContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountLabel: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  paymentMethodCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedPaymentMethod: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  paymentMethodIcon: {
    width: 60,
    height: 60,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  payButton: {
    marginTop: 16,
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  verifyingText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  successContainer: {
    alignItems: 'center',
    padding: 24,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  transactionId: {
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 24,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    width: '100%',
  },
});