import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { userRouter } from "./routes/user/router";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  user: userRouter,
});

export type AppRouter = typeof appRouter;