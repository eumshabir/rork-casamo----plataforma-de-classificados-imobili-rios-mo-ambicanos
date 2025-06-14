import { trpcClient } from '@/lib/trpc';

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

export const paymentService = {
  // Process payment
  processPayment: async (paymentRequest: PaymentRequest): Promise<PaymentResponse> => {
    try {
      const response = await trpcClient.payment.processPayment.mutate(paymentRequest);
      return response;
    } catch (err) {
      const error = err as Error;
      console.error('Error processing payment:', error);
      
      // Return a formatted error response
      return {
        success: false,
        message: error.message || 'Falha no processamento do pagamento',
        timestamp: new Date().toISOString()
      };
    }
  },
  
  // Verify payment status
  verifyPayment: async (transactionId: string): Promise<PaymentResponse> => {
    try {
      const response = await trpcClient.payment.verifyPayment.query({ transactionId });
      return response;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error('Falha ao verificar pagamento');
    }
  },
  
  // Get payment history
  getPaymentHistory: async (): Promise<any[]> => {
    try {
      const history = await trpcClient.payment.getPaymentHistory.query();
      return history;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw new Error('Falha ao buscar histórico de pagamentos');
    }
  },
  
  // Get premium plans
  getPremiumPlans: async (): Promise<any[]> => {
    try {
      const plans = await trpcClient.payment.getPremiumPlans.query();
      return plans;
    } catch (error) {
      console.error('Error fetching premium plans:', error);
      throw new Error('Falha ao buscar planos premium');
    }
  },
  
  // Get boost options for properties
  getBoostOptions: async (): Promise<any[]> => {
    try {
      const options = await trpcClient.payment.getBoostOptions.query();
      return options;
    } catch (error) {
      console.error('Error fetching boost options:', error);
      throw new Error('Falha ao buscar opções de destaque');
    }
  },
  
  // Apply boost to a property
  boostProperty: async (propertyId: string, boostOptionId: string, paymentRequest: PaymentRequest): Promise<PaymentResponse> => {
    try {
      const response = await trpcClient.payment.boostProperty.mutate({
        propertyId,
        boostOptionId,
        ...paymentRequest
      });
      return response;
    } catch (error) {
      console.error('Error boosting property:', error);
      throw new Error('Falha ao destacar imóvel');
    }
  }
};