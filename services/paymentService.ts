import { apiClient, handleApiError } from './api';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  method: string;
  phoneNumber: string;
  description: string;
  reference?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  timestamp: string;
}

// Available payment methods
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'mpesa',
    name: 'M-Pesa',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png'
  },
  {
    id: 'emola',
    name: 'e-Mola',
    icon: 'https://play-lh.googleusercontent.com/vD0U2WH5J8QJ0KzJO0iVoHnQ7JWDmOBgXRaGbOV9KKNQXInCUCGYn3KwCuJM3Uvo3w'
  }
];

export const paymentService = {
  // Process payment
  processPayment: async (paymentRequest: PaymentRequest): Promise<PaymentResponse> => {
    try {
      // Try to use the real API first
      const response = await apiClient.post('/payments/process', paymentRequest);
      return response.data;
    } catch (error) {
      // Check if it's a validation error for phone number
      if (error.response?.status === 422 && error.response?.data?.errors?.phoneNumber) {
        return {
          success: false,
          message: 'Número de telefone inválido. Use o formato: +258 8X XXX XXXX',
          timestamp: new Date().toISOString()
        };
      }
      
      // If API is not available or other error, use mock
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validate phone number format for Mozambique
      const phoneRegex = /^\+258\s?8[234]\d{7}$/;
      if (!phoneRegex.test(paymentRequest.phoneNumber)) {
        return {
          success: false,
          message: 'Número de telefone inválido. Use o formato: +258 8X XXX XXXX',
          timestamp: new Date().toISOString()
        };
      }
      
      // Simulate successful payment (90% success rate)
      const isSuccessful = Math.random() < 0.9;
      
      if (isSuccessful) {
        return {
          success: true,
          transactionId: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          message: 'Pagamento processado com sucesso',
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          message: 'Falha no processamento do pagamento. Tente novamente.',
          timestamp: new Date().toISOString()
        };
      }
    }
  },
  
  // Verify payment status
  verifyPayment: async (transactionId: string): Promise<PaymentResponse> => {
    try {
      // Try to use the real API first
      const response = await apiClient.get(`/payments/verify/${transactionId}`);
      return response.data;
    } catch (error) {
      // If API is not available, use mock
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful verification (95% success rate)
      const isVerified = Math.random() < 0.95;
      
      if (isVerified) {
        return {
          success: true,
          transactionId,
          message: 'Pagamento verificado com sucesso',
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          transactionId,
          message: 'Não foi possível verificar o pagamento. Tente novamente mais tarde.',
          timestamp: new Date().toISOString()
        };
      }
    }
  },
  
  // Get payment history
  getPaymentHistory: async (): Promise<any[]> => {
    try {
      // Try to use the real API first
      const response = await apiClient.get('/payments/history');
      return response.data;
    } catch (error) {
      // If API is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock payment history
      return [
        {
          id: 'pay-001',
          amount: 1500,
          currency: 'MZN',
          method: 'mpesa',
          status: 'completed',
          description: 'Assinatura Premium - 1 mês',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'pay-002',
          amount: 500,
          currency: 'MZN',
          method: 'emola',
          status: 'completed',
          description: 'Destaque de anúncio - 7 dias',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    }
  },
  
  // Get premium plans
  getPremiumPlans: async (): Promise<any[]> => {
    try {
      // Try to use the real API first
      const response = await apiClient.get('/payments/premium-plans');
      return response.data;
    } catch (error) {
      // If API is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Return mock premium plans
      return [
        {
          id: 'premium-monthly',
          name: 'Mensal',
          price: 1500,
          currency: 'MZN',
          duration: 30, // days
          features: [
            'Anúncios ilimitados',
            'Destaque nos resultados',
            'Selo de anunciante premium',
            'Estatísticas detalhadas'
          ]
        },
        {
          id: 'premium-quarterly',
          name: 'Trimestral',
          price: 4000,
          currency: 'MZN',
          duration: 90, // days
          features: [
            'Anúncios ilimitados',
            'Destaque nos resultados',
            'Selo de anunciante premium',
            'Estatísticas detalhadas',
            'Desconto de 11%'
          ]
        },
        {
          id: 'premium-yearly',
          name: 'Anual',
          price: 15000,
          currency: 'MZN',
          duration: 365, // days
          features: [
            'Anúncios ilimitados',
            'Destaque nos resultados',
            'Selo de anunciante premium',
            'Estatísticas detalhadas',
            'Desconto de 16%',
            'Suporte prioritário'
          ]
        }
      ];
    }
  },
  
  // Get boost options for properties
  getBoostOptions: async (): Promise<any[]> => {
    try {
      // Try to use the real API first
      const response = await apiClient.get('/payments/boost-options');
      return response.data;
    } catch (error) {
      // If API is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Return mock boost options
      return [
        {
          id: 'boost-7',
          name: 'Destaque 7 dias',
          price: 500,
          currency: 'MZN',
          duration: 7, // days
          features: [
            'Posição de destaque',
            'Marca visual especial',
            'Prioridade nas buscas'
          ]
        },
        {
          id: 'boost-15',
          name: 'Destaque 15 dias',
          price: 900,
          currency: 'MZN',
          duration: 15, // days
          features: [
            'Posição de destaque',
            'Marca visual especial',
            'Prioridade nas buscas',
            'Desconto de 10%'
          ]
        },
        {
          id: 'boost-30',
          name: 'Destaque 30 dias',
          price: 1600,
          currency: 'MZN',
          duration: 30, // days
          features: [
            'Posição de destaque',
            'Marca visual especial',
            'Prioridade nas buscas',
            'Desconto de 20%'
          ]
        }
      ];
    }
  },
  
  // Apply boost to a property
  boostProperty: async (propertyId: string, boostOptionId: string, paymentRequest: PaymentRequest): Promise<PaymentResponse> => {
    try {
      // Try to use the real API first
      const response = await apiClient.post('/payments/boost-property', {
        propertyId,
        boostOptionId,
        ...paymentRequest
      });
      return response.data;
    } catch (error) {
      // If API is not available, use the process payment mock
      return paymentService.processPayment(paymentRequest);
    }
  }
};