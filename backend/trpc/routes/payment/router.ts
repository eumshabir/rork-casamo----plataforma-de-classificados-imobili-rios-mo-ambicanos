import { z } from "zod";
import { router, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const paymentRouter = router({
  // Upgrade user to premium
  upgradeToPremium: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        paymentMethod: z.string(),
        phoneNumber: z.string(),
        planDuration: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { planId, paymentMethod, phoneNumber, planDuration } = input;
      
      // Get plan duration based on planId
      let duration = planDuration || 30; // Default to 30 days
      
      if (planId === "monthly") {
        duration = 30;
      } else if (planId === "quarterly") {
        duration = 90;
      } else if (planId === "yearly") {
        duration = 365;
      }
      
      // Calculate premium expiration date
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + duration);
      
      // Update user to premium
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          role: "premium",
          premiumUntil,
        },
      });
      
      // Record payment
      await ctx.prisma.payment.create({
        data: {
          userId: ctx.user.id,
          amount: getPlanPrice(planId),
          currency: "MZN",
          method: paymentMethod,
          status: "completed",
          description: `Premium subscription (${planId})`,
        },
      });
      
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
  
  // Boost a property
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
      
      // Check if property exists and belongs to user
      const property = await ctx.prisma.property.findUnique({
        where: { id: propertyId },
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
          message: "You do not have permission to boost this property",
        });
      }
      
      // Calculate boost expiration date
      const boostedUntil = new Date();
      let duration = 7; // Default to 7 days
      
      if (boostOptionId === "7days") {
        duration = 7;
      } else if (boostOptionId === "15days") {
        duration = 15;
      } else if (boostOptionId === "30days") {
        duration = 30;
      }
      
      boostedUntil.setDate(boostedUntil.getDate() + duration);
      
      // Update property to featured
      await ctx.prisma.property.update({
        where: { id: propertyId },
        data: {
          featured: true,
          boostedUntil,
        },
      });
      
      // Record payment
      await ctx.prisma.payment.create({
        data: {
          userId: ctx.user.id,
          amount: getBoostPrice(boostOptionId),
          currency: "MZN",
          method: paymentMethod,
          status: "completed",
          description: `Property boost (${boostOptionId})`,
          propertyId,
        },
      });
      
      return {
        success: true,
        message: "Imóvel destacado com sucesso",
        expiresAt: boostedUntil.toISOString(),
      };
    }),
  
  // Get payment history
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const payments = await ctx.prisma.payment.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
    });
    
    return payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      status: payment.status,
      paymentMethod: payment.method,
      createdAt: payment.createdAt.toISOString(),
    }));
  }),
});

// Helper functions to get prices
function getPlanPrice(planId: string): number {
  switch (planId) {
    case "monthly":
      return 1500;
    case "quarterly":
      return 4000;
    case "yearly":
      return 15000;
    default:
      return 1500;
  }
}

function getBoostPrice(boostOptionId: string): number {
  switch (boostOptionId) {
    case "7days":
      return 500;
    case "15days":
      return 900;
    case "30days":
      return 1600;
    default:
      return 500;
  }
}