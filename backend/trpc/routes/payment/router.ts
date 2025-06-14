import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

// Mock function to simulate M-Pesa payment
// In a real app, you would integrate with the M-Pesa API
async function processMPesaPayment(phoneNumber: string, amount: number, description: string) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Validate phone number format for Mozambique
  const phoneRegex = /^\+258\s?8[234]\d{7}$/;
  if (!phoneRegex.test(phoneNumber)) {
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

// Mock function to simulate e-Mola payment
// In a real app, you would integrate with the e-Mola API
async function processEMolaPayment(phoneNumber: string, amount: number, description: string) {
  // Similar to M-Pesa but with e-Mola specifics
  return processMPesaPayment(phoneNumber, amount, description);
}

export const paymentRouter = router({
  // Process payment
  processPayment: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        currency: z.string(),
        method: z.string(),
        phoneNumber: z.string(),
        description: z.string(),
        reference: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { amount, currency, method, phoneNumber, description, reference } = input;
      
      let paymentResult;
      
      // Process payment based on method
      if (method === 'mpesa') {
        paymentResult = await processMPesaPayment(phoneNumber, amount, description);
      } else if (method === 'emola') {
        paymentResult = await processEMolaPayment(phoneNumber, amount, description);
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid payment method",
        });
      }
      
      if (paymentResult.success) {
        // Create payment record
        await ctx.prisma.payment.create({
          data: {
            amount,
            currency,
            method,
            status: 'completed',
            description,
            reference,
            transactionId: paymentResult.transactionId,
            userId: ctx.user.id,
          },
        });
      }
      
      return paymentResult;
    }),
  
  // Verify payment status
  verifyPayment: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Check if payment exists
      const payment = await ctx.prisma.payment.findFirst({
        where: {
          transactionId: input.transactionId,
        },
      });
      
      if (!payment) {
        return {
          success: false,
          transactionId: input.transactionId,
          message: 'Transação não encontrada',
          timestamp: new Date().toISOString(),
        };
      }
      
      return {
        success: payment.status === 'completed',
        transactionId: input.transactionId,
        message: payment.status === 'completed' 
          ? 'Pagamento verificado com sucesso' 
          : 'Pagamento pendente ou falhou',
        timestamp: new Date().toISOString(),
      };
    }),
  
  // Get payment history
  getPaymentHistory: protectedProcedure
    .query(async ({ ctx }) => {
      const payments = await ctx.prisma.payment.findMany({
        where: {
          userId: ctx.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return payments;
    }),
  
  // Get premium plans
  getPremiumPlans: publicProcedure
    .query(async ({ ctx }) => {
      // Get settings
      const settings = await ctx.prisma.settings.findUnique({
        where: { id: "settings" },
      });
      
      // Default values if settings not found
      const premiumMonthlyPrice = settings?.premiumMonthlyPrice || 1500;
      const premiumQuarterlyPrice = settings?.premiumQuarterlyPrice || 4000;
      const premiumYearlyPrice = settings?.premiumYearlyPrice || 15000;
      const currency = settings?.currency || "MZN";
      
      return [
        {
          id: 'premium-monthly',
          name: 'Mensal',
          price: premiumMonthlyPrice,
          currency,
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
          price: premiumQuarterlyPrice,
          currency,
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
          price: premiumYearlyPrice,
          currency,
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
    }),
  
  // Get boost options
  getBoostOptions: publicProcedure
    .query(async ({ ctx }) => {
      // Get settings
      const settings = await ctx.prisma.settings.findUnique({
        where: { id: "settings" },
      });
      
      // Default values if settings not found
      const boost7DaysPrice = settings?.boost7DaysPrice || 500;
      const boost15DaysPrice = settings?.boost15DaysPrice || 900;
      const boost30DaysPrice = settings?.boost30DaysPrice || 1600;
      const currency = settings?.currency || "MZN";
      
      return [
        {
          id: 'boost-7',
          name: 'Destaque 7 dias',
          price: boost7DaysPrice,
          currency,
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
          price: boost15DaysPrice,
          currency,
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
          price: boost30DaysPrice,
          currency,
          duration: 30, // days
          features: [
            'Posição de destaque',
            'Marca visual especial',
            'Prioridade nas buscas',
            'Desconto de 20%'
          ]
        }
      ];
    }),
  
  // Upgrade to premium
  upgradeToPremium: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        paymentMethod: z.string(),
        phoneNumber: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { planId, paymentMethod, phoneNumber } = input;
      
      // Get premium plans
      const plans = await ctx.trpc.payment.getPremiumPlans.query();
      
      // Find the selected plan
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid plan",
        });
      }
      
      // Process payment
      const paymentResult = await ctx.trpc.payment.processPayment.mutate({
        amount: plan.price,
        currency: plan.currency,
        method: paymentMethod,
        phoneNumber,
        description: `Assinatura Premium - ${plan.name}`,
      });
      
      if (!paymentResult.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: paymentResult.message,
        });
      }
      
      // Calculate premium expiration date
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + plan.duration);
      
      // Update user to premium
      const updatedUser = await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          role: "premium",
          premiumUntil,
        },
      });
      
      // Return updated user
      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        verified: updatedUser.verified,
        premiumUntil: updatedUser.premiumUntil,
        createdAt: updatedUser.createdAt,
      };
    }),
  
  // Boost property
  boostProperty: protectedProcedure
    .input(
      z.object({
        propertyId: z.string(),
        boostOptionId: z.string(),
        paymentMethod: z.string(),
        phoneNumber: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { propertyId, boostOptionId, paymentMethod, phoneNumber } = input;
      
      // Check if property exists and belongs to the user
      const property = await ctx.prisma.property.findUnique({
        where: {
          id: propertyId,
        },
      });
      
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }
      
      if (property.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to boost this property",
        });
      }
      
      // Get boost options
      const boostOptions = await ctx.trpc.payment.getBoostOptions.query();
      
      // Find the selected option
      const boostOption = boostOptions.find(o => o.id === boostOptionId);
      
      if (!boostOption) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid boost option",
        });
      }
      
      // Process payment
      const paymentResult = await ctx.trpc.payment.processPayment.mutate({
        amount: boostOption.price,
        currency: boostOption.currency,
        method: paymentMethod,
        phoneNumber,
        description: `Destaque de anúncio - ${boostOption.name}`,
        reference: propertyId,
      });
      
      if (!paymentResult.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: paymentResult.message,
        });
      }
      
      // Calculate boost expiration date
      const boostedUntil = new Date();
      boostedUntil.setDate(boostedUntil.getDate() + boostOption.duration);
      
      // Update property to featured
      await ctx.prisma.property.update({
        where: {
          id: propertyId,
        },
        data: {
          featured: true,
          boostedUntil,
        },
      });
      
      return {
        success: true,
        message: "Imóvel destacado com sucesso",
        expiresAt: boostedUntil.toISOString(),
      };
    }),
});