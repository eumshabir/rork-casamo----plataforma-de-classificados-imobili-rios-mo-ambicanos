import { authService } from './authService';
import { handleApiError, shouldUseTRPC, shouldUseSupabase } from './api';
import { trpcClient } from '@/lib/trpc';
import { supabaseAuthService } from './supabaseService';
import { supabasePropertyService } from './supabaseService';

// Payment methods
export const PAYMENT_METHODS = [
  {
    id: 'mpesa',
    name: 'M-Pesa',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png',
  },
  {
    id: 'emola',
    name: 'eMola',
    icon: 'https://play-lh.googleusercontent.com/vPGAsKxiOXRvF390AYH9nyoLQdvPsJIcQ5uCO8VIgGkGjlg0L3GNtKzJwbpOiK1sZQ',
  },
  {
    id: 'bank',
    name: 'Transferência Bancária',
    icon: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png',
  }
];

// Payment accounts
export const PAYMENT_ACCOUNTS = {
  mpesa: {
    number: '841234567',
    name: 'CasaMoç, Lda',
  },
  emola: {
    number: '861234567',
    name: 'CasaMoç, Lda',
  },
  bank: {
    number: '12345678910',
    name: 'CasaMoç, Lda - BCI',
  },
  whatsapp: '841234567',
};

// Premium plans
export const PREMIUM_PLANS = [
  {
    id: 'monthly',
    name: 'Mensal',
    price: 1500,
    duration: 30, // days
    description: 'Acesso premium por 1 mês',
    features: [
      'Anúncios ilimitados',
      'Destaque na pesquisa',
      'Suporte prioritário',
      'Estatísticas detalhadas',
    ],
  },
  {
    id: 'quarterly',
    name: 'Trimestral',
    price: 4000,
    duration: 90, // days
    description: 'Acesso premium por 3 meses',
    features: [
      'Anúncios ilimitados',
      'Destaque na pesquisa',
      'Suporte prioritário',
      'Estatísticas detalhadas',
      '1 destaque grátis por mês',
    ],
    discount: '11%',
  },
  {
    id: 'yearly',
    name: 'Anual',
    price: 15000,
    duration: 365, // days
    description: 'Acesso premium por 1 ano',
    features: [
      'Anúncios ilimitados',
      'Destaque na pesquisa',
      'Suporte prioritário',
      'Estatísticas detalhadas',
      '2 destaques grátis por mês',
      'Verificação prioritária',
    ],
    discount: '17%',
    popular: true,
  },
];

// Boost options
export const BOOST_OPTIONS = [
  {
    id: '7days',
    name: '7 dias',
    price: 500,
    duration: 7, // days
    description: 'Destaque por 7 dias',
  },
  {
    id: '15days',
    name: '15 dias',
    price: 900,
    duration: 15, // days
    description: 'Destaque por 15 dias',
    discount: '10%',
  },
  {
    id: '30days',
    name: '30 dias',
    price: 1600,
    duration: 30, // days
    description: 'Destaque por 30 dias',
    discount: '20%',
    popular: true,
  },
];

export const paymentService = {
  // Process payment for premium subscription
  processPremiumPayment: async (planId: string, paymentMethod: string, phoneNumber: string): Promise<any> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        // Find the plan
        const plan = PREMIUM_PLANS.find(p => p.id === planId);
        if (!plan) {
          throw new Error('Plano não encontrado');
        }
        
        return await supabaseAuthService.upgradeToPremium(planId, paymentMethod, phoneNumber);
      }
      
      // Try to use tRPC if Supabase is not available
      if (await shouldUseTRPC()) {
        return await trpcClient.payment.upgradeToPremium.mutate({
          planId,
          paymentMethod,
          phoneNumber,
        });
      }
      
      // If neither is available, use mock
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the plan
      const plan = PREMIUM_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plano não encontrado');
      }
      
      // Calculate premium expiration date
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + plan.duration);
      
      // Update user to premium
      await authService.upgradeToPremium(plan.duration);
      
      return {
        success: true,
        message: "Pagamento processado com sucesso",
        expiresAt: premiumUntil.toISOString(),
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Process payment for property boost
  processBoostPayment: async (propertyId: string, boostOptionId: string, paymentMethod: string, phoneNumber: string): Promise<any> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        return await supabasePropertyService.boostProperty(propertyId, boostOptionId, paymentMethod, phoneNumber);
      }
      
      // Try to use tRPC if Supabase is not available
      if (await shouldUseTRPC()) {
        return await trpcClient.payment.boostProperty.mutate({
          propertyId,
          boostOptionId,
          paymentMethod,
          phoneNumber,
        });
      }
      
      // If neither is available, use mock
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the boost option
      const boostOption = BOOST_OPTIONS.find(b => b.id === boostOptionId);
      if (!boostOption) {
        throw new Error('Opção de destaque não encontrada');
      }
      
      // Calculate boost expiration date
      const boostedUntil = new Date();
      boostedUntil.setDate(boostedUntil.getDate() + boostOption.duration);
      
      return {
        success: true,
        message: "Pagamento processado com sucesso",
        expiresAt: boostedUntil.toISOString(),
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Get payment history
  getPaymentHistory: async (): Promise<any[]> => {
    try {
      // Try to use Supabase first
      if (await shouldUseSupabase()) {
        // Implementation would go here
      }
      
      // Try to use tRPC if Supabase is not available
      if (await shouldUseTRPC()) {
        return await trpcClient.payment.getPaymentHistory.query();
      }
      
      // If neither is available, use mock
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock payment history
      return [
        {
          id: '1',
          amount: 1500,
          currency: 'MZN',
          description: 'Assinatura Premium Mensal',
          status: 'completed',
          paymentMethod: 'mpesa',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          amount: 500,
          currency: 'MZN',
          description: 'Destaque de Imóvel (7 dias)',
          status: 'completed',
          paymentMethod: 'emola',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};