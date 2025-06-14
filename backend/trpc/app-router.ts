import { router } from "./create-context";

// Auth routes
import { loginProcedure } from "./routes/auth/login/route";
import { registerProcedure } from "./routes/auth/register/route";

// Property routes
import { getPropertiesProcedure } from "./routes/property/get-properties/route";
import { getFeaturedPropertiesProcedure } from "./routes/property/get-featured-properties/route";
import { getUserPropertiesProcedure } from "./routes/property/get-user-properties/route";

// Example route
import hiProcedure from "./routes/example/hi/route";

export const appRouter = router({
  example: router({
    hi: hiProcedure,
  }),
  
  auth: router({
    login: loginProcedure,
    register: registerProcedure,
  }),
  
  property: router({
    getProperties: getPropertiesProcedure,
    getFeaturedProperties: getFeaturedPropertiesProcedure,
    getUserProperties: getUserPropertiesProcedure,
  }),
});

export type AppRouter = typeof appRouter;