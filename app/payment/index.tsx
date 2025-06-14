import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, AlertCircle, Copy, Share2, Phone } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { paymentService, PAYMENT_METHODS, PAYMENT_ACCOUNTS } from '@/services/paymentService';
import * as Clipboard from 'expo-clipboard/build/Clipboard';

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
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'instructions' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [referenceCode, setReferenceCode] = useState<string>('');
  
  const amount = params.amount ? parseFloat(params.amount) : 0;
  const planDuration = params.planDuration ? parseInt(params.planDuration) : 0;
  const description = params.description || 'Pagamento CasaMoç';
  
  useEffect(() => {
    // Generate a reference code for the payment
    setReferenceCode(`CM${Date.now().toString().slice(-6)}`);
  }, []);
  
  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Erro', 'Por favor, insira um número de telefone válido.');
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      // Show payment instructions instead of processing payment
      setPaymentStatus('instructions');
      setIsProcessing(false);
      
      // If this is a premium plan purchase, update user status after confirmation
      if (params.planId && planDuration > 0) {
        // This will be done after manual confirmation
      }
    } catch (error) {
      setPaymentStatus('failed');
      setErrorMessage('Ocorreu um erro ao processar o pagamento. Tente novamente.');
      setIsProcessing(false);
    }
  };
  
  const handleCopyNumber = async () => {
    const accountInfo = PAYMENT_ACCOUNTS[selectedMethod as keyof typeof PAYMENT_ACCOUNTS];
    if (accountInfo && typeof accountInfo === 'object' && 'number' in accountInfo) {
      await Clipboard.setStringAsync(accountInfo.number);
      Alert.alert('Copiado', 'Número copiado para a área de transferência');
    }
  };
  
  const handleCopyReference = async () => {
    await Clipboard.setStringAsync(referenceCode);
    Alert.alert('Copiado', 'Referência copiada para a área de transferência');
  };
  
  const handleWhatsApp = async () => {
    const whatsappNumber = PAYMENT_ACCOUNTS.whatsapp;
    const message = `Olá! Acabei de fazer um pagamento para *${description}* no valor de *${amount} MZN* via *${PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}*. Minha referência é: *${referenceCode}*`;
    
    const whatsappUrl = `whatsapp://send?phone=+258${whatsappNumber}&text=${encodeURIComponent(message)}`;
    
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    } else {
      Alert.alert(
        'WhatsApp não encontrado',
        'Por favor, instale o WhatsApp para enviar o comprovativo ou contacte-nos pelo número +258 ' + whatsappNumber
      );
    }
  };
  
  const handleCall = async () => {
    const phoneNumber = PAYMENT_ACCOUNTS.whatsapp;
    const phoneUrl = `tel:+258${phoneNumber}`;
    
    const canOpen = await Linking.canOpenURL(phoneUrl);
    
    if (canOpen) {
      await Linking.openURL(phoneUrl);
    } else {
      Alert.alert(
        'Não foi possível fazer a chamada',
        'Por favor, tente novamente mais tarde ou use outro método de contacto.'
      );
    }
  };
  
  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment confirmation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPaymentStatus('success');
      
      // If this is a premium plan purchase, update user status
      if (params.planId && planDuration > 0) {
        await upgradeToPremium(planDuration);
      }
      
      // Show success message and redirect
      setTimeout(() => {
        Alert.alert(
          'Pagamento Registrado',
          'Seu pagamento foi registrado e será confirmado em breve. Obrigado!',
          [{ text: 'OK', onPress: () => router.replace('/') }]
        );
      }, 1000);
    } catch (error) {
      setErrorMessage('Ocorreu um erro ao confirmar o pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Helper function to safely get account info
  const getAccountInfo = (method: string, property: 'number' | 'name'): string => {
    const accountInfo = PAYMENT_ACCOUNTS[method as keyof typeof PAYMENT_ACCOUNTS];
    if (accountInfo && typeof accountInfo === 'object' && property in accountInfo) {
      return (accountInfo as any)[property];
    }
    return '';
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
          <Text style={styles.successTitle}>Pagamento Registrado</Text>
          <Text style={styles.successText}>
            Seu pagamento foi registrado e será confirmado em breve.
          </Text>
          <Text style={styles.referenceCode}>
            Referência: {referenceCode}
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
      ) : paymentStatus === 'instructions' ? (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instruções de Pagamento</Text>
          
          <View style={styles.paymentMethodInfo}>
            <Image
              source={{ uri: PAYMENT_METHODS.find(m => m.id === selectedMethod)?.icon }}
              style={styles.paymentMethodIconLarge}
            />
            <Text style={styles.paymentMethodName}>
              {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}
            </Text>
          </View>
          
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Faça o pagamento para:</Text>
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Número:</Text>
                <View style={styles.accountValueContainer}>
                  <Text style={styles.accountValue}>
                    {getAccountInfo(selectedMethod, 'number')}
                  </Text>
                  <TouchableOpacity onPress={handleCopyNumber}>
                    <Copy size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Nome:</Text>
                <Text style={styles.accountValue}>
                  {getAccountInfo(selectedMethod, 'name')}
                </Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Valor:</Text>
                <Text style={styles.accountValue}>{amount.toLocaleString('pt-MZ')} MZN</Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Referência:</Text>
                <View style={styles.accountValueContainer}>
                  <Text style={styles.accountValue}>{referenceCode}</Text>
                  <TouchableOpacity onPress={handleCopyReference}>
                    <Copy size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Envie o comprovativo via WhatsApp:</Text>
              <Button
                title="Enviar Comprovativo via WhatsApp"
                onPress={handleWhatsApp}
                style={styles.whatsappButton}
                icon={<Share2 size={20} color="white" />}
              />
              <Text style={styles.orText}>ou</Text>
              <Button
                title="Ligar para Confirmar"
                onPress={handleCall}
                style={styles.callButton}
                icon={<Phone size={20} color="white" />}
              />
            </View>
          </View>
          
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Confirme seu pagamento:</Text>
              <Text style={styles.confirmText}>
                Após enviar o comprovativo, clique no botão abaixo para registrar seu pagamento.
                Nossa equipe irá verificar e confirmar em breve.
              </Text>
              <Button
                title={isProcessing ? "Processando..." : "Confirmar Pagamento"}
                onPress={handleConfirmPayment}
                loading={isProcessing}
                disabled={isProcessing}
                style={styles.confirmButton}
              />
            </View>
          </View>
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
            Você receberá instruções para completar o pagamento manualmente.
          </Text>
          
          <Button
            title={isProcessing ? 'Processando...' : 'Continuar'}
            onPress={handlePayment}
            loading={isProcessing}
            disabled={isProcessing}
            style={styles.payButton}
          />
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
  paymentMethodIconLarge: {
    width: 80,
    height: 80,
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
  referenceCode: {
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
  instructionsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  paymentMethodInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    color: 'white',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  accountInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  accountLabel: {
    width: 100,
    fontSize: 14,
    color: Colors.textLight,
  },
  accountValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginRight: 8,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    marginBottom: 12,
  },
  callButton: {
    backgroundColor: Colors.secondary,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 8,
    color: Colors.textLight,
  },
  confirmText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: Colors.success,
  },
});