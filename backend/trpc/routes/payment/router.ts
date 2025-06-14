import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

// In a real app, you would integrate with actual payment providers
// For now, we'll simulate payment processing

export const paymentRouter = createTRPCRouter({
  // Process payment
  processPayment: protectedProcedure
    .input(z.object({
      amount: z.number().positive(),
      currency: z.string(),
      method: z.string(),
      phoneNumber: z.string(),
      description: z.string(),
      reference: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate phone number format for Mozambique
      const phoneRegex = /^\+258\s?8[234]\d{7}$/;
      if (!phoneRegex.test(input.phoneNumber)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Número de telefone inválido. Use o formato: +258 8X XXX XXXX",
        });
      }
      
      // In a real app, you would integrate with M-Pesa or e-Mola API here
      // For now, we'll simulate a successful payment
      
      // Create payment record
      const payment = await ctx.prisma.payment.create({
        data: {
          userId: ctx.user.id,
          amount: input.amount,
          currency: input.currency,
          method: input.method,
          status: "completed", // In a real app, this would initially be "pending"
          description: input.description,
          transactionId: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          reference: input.reference,
        },
      });
      
      // Create notification for the user
      await ctx.prisma.notification.create({
        data: {
          userId: ctx.user.id,
          title: "Pagamento processado",
          body: `Seu pagamento de ${input.amount} ${input.currency} foi processado com sucesso.`,
          data: {
            type: "payment",
            paymentId: payment.id,
          },
          read: false,
        },
      });
      
      return {
        success: true,
        transactionId: payment.transactionId,
        message: "Pagamento processado com sucesso",
        timestamp: payment.createdAt.toISOString(),
      };
    }),
  
  // Verify payment status
  verifyPayment: protectedProcedure
    .input(z.object({ transactionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.findFirst({
        where: {
          transactionId: input.transactionId,
          userId: ctx.user.id,
        },
      });
      
      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transação não encontrada",
        });
      }
      
      return {
        success: payment.status === "completed",
        transactionId: payment.transactionId,
        message: payment.status === "completed"
          ? "Pagamento verificado com sucesso"
          : "Pagamento pendente ou falhou",
        timestamp: payment.createdAt.toISOString(),
      };
    }),
  
  // Get payment history
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const payments = await ctx.prisma.payment.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
    });
    
    return payments;
  }),
  
  // Get premium plans
  getPremiumPlans: protectedProcedure.query(async () => {
    // In a real app, these would come from a database
    return [
      {
        id: "premium-monthly",
        name: "Mensal",
        price: 1500,
        currency: "MZN",
        duration: 30, // days
        features: [
          "Anúncios ilimitados",
          "Destaque nos resultados",
          "Selo de anunciante premium",
          "Estatísticas detalhadas",
        ],
      },
      {
        id: "premium-quarterly",
        name: "Trimestral",
        price: 4000,
        currency: "MZN",
        duration: 90, // days
        features: [
          "Anúncios ilimitados",
          "Destaque nos resultados",
          "Selo de anunciante premium",
          "Estatísticas detalhadas",
          "Desconto de 11%",
        ],
      },
      {
        id: "premium-yearly",
        name: "Anual",
        price: 15000,
        currency: "MZN",
        duration: 365, // days
        features: [
          "Anúncios ilimitados",
          "Destaque nos resultados",
          "Selo de anunciante premium",
          "Estatísticas detalhadas",
          "Desconto de 16%",
          "Suporte prioritário",
        ],
      },
    ];
  }),
  
  // Get boost options for properties
  getBoostOptions: protectedProcedure.query(async () => {
    // In a real app, these would come from a database
    return [
      {
        id: "boost-7",
        name: "Destaque 7 dias",
        price: 500,
        currency: "MZN",
        duration: 7, // days
        features: [
          "Posição de destaque",
          "Marca visual especial",
          "Prioridade nas buscas",
        ],
      },
      {
        id: "boost-15",
        name: "Destaque 15 dias",
        price: 900,
        currency: "MZN",
        duration: 15, // days
        features: [
          "Posição de destaque",
          "Marca visual especial",
          "Prioridade nas buscas",
          "Desconto de 10%",
        ],
      },
      {
        id: "boost-30",
        name: "Destaque 30 dias",
        price: 1600,
        currency: "MZN",
        duration: 30, // days
        features: [
          "Posição de destaque",
          "Marca visual especial",
          "Prioridade nas buscas",
          "Desconto de 20%",
        ],
      },
    ];
  }),
  
  // Upgrade to premium
  upgradeToPremium: protectedProcedure
    .input(z.object({
      planId: z.string(),
      paymentMethod: z.string(),
      phoneNumber: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get plan details
      const plans = await paymentRouter.getPremiumPlans.query(undefined, ctx);
      const plan = plans.find(p => p.id === input.planId);
      
      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plano não encontrado",
        });
      }
      
      // Process payment
      const payment = await paymentRouter.processPayment.mutation({
        amount: plan.price,
        currency: plan.currency,
        method: input.paymentMethod,
        phoneNumber: input.phoneNumber,
        description: `Assinatura Premium - ${plan.name}`,
      }, ctx);
      
      if (payment.success) {
        // Calculate premium expiration date
        const premiumUntil = new Date();
        premiumUntil.setDate(premiumUntil.getDate() + plan.duration);
        
        // Update user's role and premium expiration
        await ctx.prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            role: "premium",
            premiumUntil,
          },
        });
        
        // Get updated user
        const updatedUser = await ctx.prisma.user.findUnique({
          where: { id: ctx.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            verified: true,
            premiumUntil: true,
            createdAt: true,
          },
        });
        
        return updatedUser;
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha no processamento do pagamento",
        });
      }
    }),
  
  // Boost a property
  boostProperty: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      boostOptionId: z.string(),
      paymentMethod: z.string(),
      phoneNumber: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if property exists and belongs to the user
      const property = await ctx.prisma.property.findFirst({
        where: {
          id: input.propertyId,
          ownerId: ctx.user.id,
        },
      });
      
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Imóvel não encontrado ou não pertence a você",
        });
      }
      
      // Get boost option details
      const boostOptions = await paymentRouter.getBoostOptions.query(undefined, ctx);
      const boostOption = boostOptions.find(b => b.id === input.boostOptionId);
      
      if (!boostOption) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Opção de destaque não encontrada",
        });
      }
      
      // Process payment
      const payment = await paymentRouter.processPayment.mutation({
        amount: boostOption.price,
        currency: boostOption.currency,
        method: input.paymentMethod,
        phoneNumber: input.phoneNumber,
        description: `${boostOption.name} para "${property.title}"`,
        reference: property.id,
      }, ctx);
      
      if (payment.success) {
        // Calculate boost expiration date
        const boostedUntil = new Date();
        boostedUntil.setDate(boostedUntil.getDate() + boostOption.duration);
        
        // Update property
        await ctx.prisma.property.update({
          where: { id: property.id },
          data: {
            featured: true,
            boostedUntil,
          },
        });
        
        return {
          success: true,
          message: `Imóvel destacado por ${boostOption.duration} dias`,
          expiresAt: boostedUntil.toISOString(),
        };
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha no processamento do pagamento",
        });
      }
    }),
});