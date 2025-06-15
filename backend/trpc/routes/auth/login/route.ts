import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '@/backend/trpc/create-context';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }))
  .mutation(async ({ input, ctx }) => {
    const { email, password } = input;
    
    // Mock user for testing - replace with actual database query
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: email,
      phone: '+1234567890',
      role: 'user' as const,
      verified: true,
      passwordHash: await bcrypt.hash('123456', 12), // Mock password hash
      createdAt: new Date().toISOString(),
    };
    
    // For demo purposes, accept any email with password "123456"
    const isValidPassword = await bcrypt.compare(password, mockUser.passwordHash);
    
    if (!isValidPassword && password !== '123456') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: mockUser.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data without password hash
    const { passwordHash, ...userWithoutPassword } = mockUser;
    
    return {
      user: userWithoutPassword,
      token,
    };
  });