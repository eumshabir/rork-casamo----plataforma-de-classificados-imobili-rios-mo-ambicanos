export type UserRole = 'user' | 'premium' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  verified: boolean;
  premiumUntil?: string;
  createdAt: string;
}