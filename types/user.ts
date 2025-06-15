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

export interface UserStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalContacts: number;
}

export interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number; // in days
  features: string[];
}