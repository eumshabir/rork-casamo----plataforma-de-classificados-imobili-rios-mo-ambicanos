import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { Context } from "./create-context";

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Base router and procedure
export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to check if user is authenticated
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Middleware to check if user is admin
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be an admin to access this resource",
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Middleware to check if user is premium
const isPremium = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  
  const now = new Date();
  const isPremiumUser = ctx.user.role === "premium" && 
    ctx.user.premiumUntil && 
    new Date(ctx.user.premiumUntil) > now;
  
  if (!isPremiumUser && ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be a premium user to access this resource",
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Protected procedure (requires authentication)
export const protectedProcedure = t.procedure.use(isAuthenticated);

// Admin procedure (requires admin role)
export const adminProcedure = t.procedure.use(isAdmin);

// Premium procedure (requires premium role)
export const premiumProcedure = t.procedure.use(isPremium);