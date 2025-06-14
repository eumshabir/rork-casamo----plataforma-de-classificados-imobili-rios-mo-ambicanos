import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Crown, Check, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  if (!user) {
    router.replace('/auth/login');
    return null;
  }
  
  const isPremium = user.role === 'premium';
  const premiumUntil = user.premiumUntil ? new Date(user.premiumUntil) : null;
  const daysRemaining = premiumUntil ? 
    Math.ceil((premiumUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  const handleRenewSubscription = () => {
    router.push('/premium');
  };
  
  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancelar Assinatura',
      'Tem certeza que deseja cancelar sua assinatura premium? Você perderá todos os benefícios premium após o término do período atual.',
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim, Cancelar', 
          onPress: () => {
            Alert.alert(
              'Assinatura Cancelada',
              'Sua assinatura foi cancelada. Você continuará com acesso premium até o final do período atual.'
            );
          },
          style: 'destructive'
        }
      ]
    );
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
        
        <Text style={styles.headerTitle}>Minha Assinatura</Text>
      </View>
      
      {isPremium ? (
        <>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Crown size={24} color={Colors.premium} />
              <Text style={styles.statusTitle}>Assinatura Premium Ativa</Text>
            </View>
            
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Válida até:</Text>
              <Text style={styles.statusValue}>
                {premiumUntil?.toLocaleDateString('pt-BR')}
              </Text>
            </View>
            
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Dias restantes:</Text>
              <Text style={styles.statusValue}>{daysRemaining} dias</Text>
            </View>
            
            {daysRemaining <= 7 && (
              <View style={styles.warningContainer}>
                <AlertCircle size={20} color={Colors.warning} />
                <Text style={styles.warningText}>
                  Sua assinatura expira em breve. Renove para continuar aproveitando os benefícios premium.
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.sectionTitle}>Benefícios Ativos</Text>
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <View style={styles.checkIcon}>
                <Check size={16} color="white" />
              </View>
              <Text style={styles.benefitText}>Publicações ilimitadas</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.checkIcon}>
                <Check size={16} color="white" />
              </View>
              <Text style={styles.benefitText}>Destaque nos resultados de busca</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.checkIcon}>
                <Check size={16} color="white" />
              </View>
              <Text style={styles.benefitText}>Selo de anunciante premium</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.checkIcon}>
                <Check size={16} color="white" />
              </View>
              <Text style={styles.benefitText}>Estatísticas detalhadas</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.checkIcon}>
                <Check size={16} color="white" />
              </View>
              <Text style={styles.benefitText}>Suporte prioritário</Text>
            </View>
          </View>
          
          <View style={styles.actionsContainer}>
            <Button
              title="Renovar Assinatura"
              onPress={handleRenewSubscription}
              style={styles.renewButton}
            />
            
            <Button
              title="Cancelar Assinatura"
              variant="outline"
              onPress={handleCancelSubscription}
              style={styles.cancelButton}
            />
          </View>
        </>
      ) : (
        <View style={styles.noPremiumContainer}>
          <View style={styles.noPremiumIcon}>
            <Crown size={40} color={Colors.textLight} />
          </View>
          
          <Text style={styles.noPremiumTitle}>Sem Assinatura Premium</Text>
          <Text style={styles.noPremiumText}>
            Você não possui uma assinatura premium ativa. Torne-se premium para desfrutar de benefícios exclusivos.
          </Text>
          
          <Button
            title="Tornar-se Premium"
            onPress={() => router.push('/premium')}
            style={styles.getPremiumButton}
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
  statusCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    color: Colors.textLight,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  benefitsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 16,
    color: Colors.text,
  },
  actionsContainer: {
    gap: 12,
  },
  renewButton: {
    marginBottom: 8,
  },
  cancelButton: {
    borderColor: Colors.error,
  },
  noPremiumContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noPremiumIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  noPremiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  noPremiumText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  getPremiumButton: {
    width: '100%',
  },
});