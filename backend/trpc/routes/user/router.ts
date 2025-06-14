import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { setPremiumProcedure } from "./set-premium/route";
import { getUsersProcedure } from "./get-users/route";
import { getUserByIdProcedure } from "./get-user-by-id/route";

export const userRouter = createTRPCRouter({
  setPremium: setPremiumProcedure,
  getUsers: getUsersProcedure,
  getUserById: getUserByIdProcedure,
});