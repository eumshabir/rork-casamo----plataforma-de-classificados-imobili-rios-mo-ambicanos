// Mock payment service for M-Pesa and e-Mola integration

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
  },
  
  // Verify payment status
  verifyPayment: async (transactionId: string): Promise<PaymentResponse> => {
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
};