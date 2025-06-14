import { inferAsyncReturnType } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { verify } from "jsonwebtoken";
import { prisma } from "../db";

interface JwtPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

export async function createContext({
  req,
}: FetchCreateContextFnOptions) {
  // Get the authorization header
  const authHeader = req.headers.get("authorization");
  
  // Default context with no user
  let user = null;
  
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    
    if (token) {
      try {
        // Verify the token
        const decoded = verify(token, process.env.JWT_SECRET || "fallback-secret") as JwtPayload;
        
        // Get the user from the database
        user = await prisma.user.findUnique({
          where: { id: decoded.userId },
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
      } catch (error) {
        // Token is invalid or expired
        console.error("Token verification failed:", error);
      }
    }
  }
  
  return {
    req,
    prisma,
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;