import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '@/backend/trpc/create-context';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const registerProcedure = publicProcedure
  .input(z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(9),
    password: z.string().min(6),
  }))
  .mutation(async ({ input, ctx }) => {
    const { name, email, phone, password } = input;
    
    // Check if user already exists (mock implementation)
    // In real implementation, check against database
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user (mock implementation)
    const user = {
      id: Date.now().toString(), // Mock ID generation
      name,
      email,
      phone,
      passwordHash,
      role: 'user' as const,
      verified: false,
      createdAt: new Date().toISOString(),
    };
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token,
    };
  });