import { publicProcedure } from "@/backend/trpc/create-context";

export const hiProcedure = publicProcedure.query(() => {
  return {
    greeting: "Hello from tRPC server!",
    timestamp: new Date().toISOString(),
  };
});

export default hiProcedure;