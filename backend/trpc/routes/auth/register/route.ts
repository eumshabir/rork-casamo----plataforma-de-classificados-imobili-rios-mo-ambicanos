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
    
    // Check if user already exists
    const existingUser = await ctx.prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User with this email already exists',
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await ctx.prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: 'user',
        verified: false,
      },
    });
    
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