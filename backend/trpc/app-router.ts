import { createTRPCRouter } from "./create-context";
import { authRouter } from "./routes/auth/router";
import { propertyRouter } from "./routes/property/router";
import { chatRouter } from "./routes/chat/router";
import { notificationRouter } from "./routes/notification/router";
import { paymentRouter } from "./routes/payment/router";
import { userRouter } from "./routes/user/router";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  property: propertyRouter,
  chat: chatRouter,
  notification: notificationRouter,
  payment: paymentRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;