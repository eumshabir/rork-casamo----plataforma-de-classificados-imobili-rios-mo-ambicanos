import { router } from "./create-context";

// Auth routes
import { loginProcedure } from "./routes/auth/login/route";
import { registerProcedure } from "./routes/auth/register/route";

// Property routes
import { getPropertiesProcedure } from "./routes/property/get-properties/route";
import { getFeaturedPropertiesProcedure } from "./routes/property/get-featured-properties/route";
import { getUserPropertiesProcedure } from "./routes/property/get-user-properties/route";
import { getPropertyByIdProcedure } from "./routes/property/get-property-by-id/route";
import { createPropertyProcedure } from "./routes/property/create-property/route";
import { updatePropertyProcedure } from "./routes/property/update-property/route";
import { deletePropertyProcedure } from "./routes/property/delete-property/route";

// User routes
import { setPremiumProcedure } from "./routes/user/set-premium/route";
import { getUserByIdProcedure } from "./routes/user/get-user-by-id/route";
import { getUsersProcedure } from "./routes/user/get-users/route";

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
    getPropertyById: getPropertyByIdProcedure,
    createProperty: createPropertyProcedure,
    updateProperty: updatePropertyProcedure,
    deleteProperty: deletePropertyProcedure,
  }),

  user: router({
    setPremium: setPremiumProcedure,
    getById: getUserByIdProcedure,
    getUsers: getUsersProcedure,
  }),
});

export type AppRouter = typeof appRouter;