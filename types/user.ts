export type UserRole = 'user' | 'premium' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  verified: boolean;
  premiumUntil?: string | null;
  createdAt: string;
};