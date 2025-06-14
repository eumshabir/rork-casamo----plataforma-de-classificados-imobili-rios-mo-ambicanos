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
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Crown, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

const premiumPlans = [
  {
    id: 'monthly',
    name: 'Mensal',
    price: 499,
    duration: 30,
    features: [
      'Publicações ilimitadas',
      'Destaque nos resultados de busca',
      'Selo de anunciante premium',
      'Estatísticas detalhadas',
      'Suporte prioritário',
    ]
  },
  {
    id: 'quarterly',
    name: 'Trimestral',
    price: 1299,
    duration: 90,
    features: [
      'Publicações ilimitadas',
      'Destaque nos resultados de busca',
      'Selo de anunciante premium',
      'Estatísticas detalhadas',
      'Suporte prioritário',
      'Desconto de 13%',
    ]
  },
  {
    id: 'annual',
    name: 'Anual',
    price: 4799,
    duration: 365,
    features: [
      'Publicações ilimitadas',
      'Destaque nos resultados de busca',
      'Selo de anunciante premium',
      'Estatísticas detalhadas',
      'Suporte prioritário',
      'Desconto de 20%',
      '2 meses grátis',
    ]
  }
];

export default function PremiumScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = React.useState('monthly');
  
  const handleSubscribe = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Necessário',
        'Você precisa estar logado para assinar um plano premium.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Entrar', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }
    
    const plan = premiumPlans.find(p => p.id === selectedPlan);
    if (plan) {
      router.push({
        pathname: '/payment',
        params: {
          amount: plan.price.toString(),
          planId: plan.id,
          planDuration: plan.duration.toString(),
          description: `Assinatura ${plan.name} - CasaMoç Premium`
        }
      });
    }
  };
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color={Colors.text} />
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Crown size={40} color={Colors.premium} />
        <Text style={styles.title}>Torne-se Premium</Text>
        <Text style={styles.subtitle}>
          Destaque seus imóveis e aumente suas chances de venda ou arrendamento
        </Text>
      </View>
      
      {/* Plan Selection */}
      <View style={styles.planSelector}>
        {premiumPlans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planOption,
              selectedPlan === plan.id && styles.selectedPlan
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            <Text
              style={[
                styles.planName,
                selectedPlan === plan.id && styles.selectedPlanText
              ]}
            >
              {plan.name}
            </Text>
            {plan.id === 'annual' && (
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>Melhor valor</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Selected Plan Details */}
      {premiumPlans.map((plan) => (
        plan.id === selectedPlan && (
          <LinearGradient
            key={plan.id}
            colors={['#F9FAFB', '#EFF6FF']}
            style={styles.selectedPlanCard}
          >
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planTitle}>{plan.name}</Text>
                <Text style={styles.planDuration}>
                  {plan.duration} dias de acesso premium
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.currency}>MZN</Text>
                <Text style={styles.price}>{plan.price}</Text>
              </View>
            </View>
            
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.checkIcon}>
                    <Check size={16} color="white" />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        )
      ))}
      
      {/* Benefits */}
      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>Benefícios Premium</Text>
        
        <View style={styles.benefitCard}>
          <View style={[styles.benefitIcon, { backgroundColor: '#EFF6FF' }]}>
            <Crown size={24} color={Colors.primary} />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Destaque nos Resultados</Text>
            <Text style={styles.benefitDescription}>
              Seus imóveis aparecem no topo dos resultados de busca, aumentando a visibilidade.
            </Text>
          </View>
        </View>
        
        <View style={styles.benefitCard}>
          <View style={[styles.benefitIcon, { backgroundColor: '#FFFBEB' }]}>
            <Crown size={24} color={Colors.premium} />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Publicações Ilimitadas</Text>
            <Text style={styles.benefitDescription}>
              Publique quantos imóveis quiser, sem limites mensais.
            </Text>
          </View>
        </View>
        
        <View style={styles.benefitCard}>
          <View style={[styles.benefitIcon, { backgroundColor: '#F0FDF4' }]}>
            <Crown size={24} color="#10B981" />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Estatísticas Detalhadas</Text>
            <Text style={styles.benefitDescription}>
              Acompanhe o desempenho dos seus anúncios com métricas avançadas.
            </Text>
          </View>
        </View>
      </View>
      
      {/* Subscribe Button */}
      <Button
        title="Assinar Agora"
        onPress={handleSubscribe}
        style={styles.subscribeButton}
      />
      
      <Text style={styles.termsText}>
        Ao assinar, você concorda com nossos Termos de Serviço e Política de Privacidade.
        Você pode cancelar sua assinatura a qualquer momento.
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
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  planSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  planOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  selectedPlan: {
    backgroundColor: Colors.primary,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  selectedPlanText: {
    color: 'white',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: Colors.premium,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  bestValueText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  selectedPlanCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  planDuration: {
    fontSize: 14,
    color: Colors.textLight,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 4,
    marginRight: 2,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  featureText: {
    fontSize: 16,
    color: Colors.text,
  },
  benefitsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  subscribeButton: {
    marginBottom: 16,
  },
  termsText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
});