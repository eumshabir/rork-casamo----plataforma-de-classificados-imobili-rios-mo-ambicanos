import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { prisma } from "./db";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors());

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// Scheduled task to remove expired boosts
// In a real app, this would be a cron job
app.get("/cron/cleanup", async (c) => {
  try {
    // Remove expired boosts
    const now = new Date();
    await prisma.property.updateMany({
      where: {
        boostedUntil: {
          lt: now,
        },
        featured: true,
      },
      data: {
        featured: false,
        boostedUntil: null,
      },
    });
    
    // Downgrade expired premium users
    await prisma.user.updateMany({
      where: {
        premiumUntil: {
          lt: now,
        },
        role: "premium",
      },
      data: {
        role: "user",
      },
    });
    
    return c.json({ status: "ok", message: "Cleanup completed" });
  } catch (error) {
    console.error("Cleanup error:", error);
    return c.json({ status: "error", message: "Cleanup failed" }, 500);
  }
});

export default app;