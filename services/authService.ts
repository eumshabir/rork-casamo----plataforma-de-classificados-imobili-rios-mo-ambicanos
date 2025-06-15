import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types/user';

export const authService = {
  // Email & Password Login
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed');
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to get user profile');
    }

    const user: User = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone || '',
      role: userProfile.role as UserRole,
      verified: userProfile.verified,
      premiumUntil: userProfile.premium_until || undefined,
      createdAt: userProfile.created_at,
    };

    return {
      user,
      token: data.session?.access_token || '',
    };
  },

  // Register new user
  register: async (userData: Partial<User>, password: string): Promise<{ user: User; token: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email!,
      password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed');
    }

    // Update user profile in our users table
    const { data: userProfile, error: updateError } = await supabase
      .from('users')
      .update({
        name: userData.name || '',
        phone: userData.phone || null,
      })
      .eq('id', data.user.id)
      .select()
      .single();

    if (updateError) {
      throw new Error('Failed to update user profile');
    }

    const user: User = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone || '',
      role: userProfile.role as UserRole,
      verified: userProfile.verified,
      premiumUntil: userProfile.premium_until || undefined,
      createdAt: userProfile.created_at,
    };

    return {
      user,
      token: data.session?.access_token || '',
    };
  },

  // Google OAuth login
  loginWithGoogle: async (): Promise<{ user: User; token: string }> => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      throw new Error(error.message);
    }

    // Note: In a real app, this would redirect to Google OAuth
    // For now, we'll throw an error to indicate it's not fully implemented
    throw new Error('Google OAuth requires proper setup in Supabase dashboard');
  },

  // Facebook OAuth login
  loginWithFacebook: async (): Promise<{ user: User; token: string }> => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
    });

    if (error) {
      throw new Error(error.message);
    }

    // Note: In a real app, this would redirect to Facebook OAuth
    // For now, we'll throw an error to indicate it's not fully implemented
    throw new Error('Facebook OAuth requires proper setup in Supabase dashboard');
  },

  // Logout
  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  // Check if user is logged in
  isAuthenticated: async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  // Get current user data
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    // Get user profile from our users table
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return null;
    }

    return {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone || '',
      role: userProfile.role as UserRole,
      verified: userProfile.verified,
      premiumUntil: userProfile.premium_until || undefined,
      createdAt: userProfile.created_at,
    };
  },

  // Update user profile
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: userProfile, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        phone: updates.phone || null,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone || '',
      role: userProfile.role as UserRole,
      verified: userProfile.verified,
      premiumUntil: userProfile.premium_until || undefined,
      createdAt: userProfile.created_at,
    };
  },

  // Upgrade to premium
  upgradeToPremium: async (planDuration: number): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Calculate premium expiration date
    const premiumUntil = new Date();
    premiumUntil.setDate(premiumUntil.getDate() + planDuration);

    const { data: userProfile, error } = await supabase
      .from('users')
      .update({
        role: 'premium',
        premium_until: premiumUntil.toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone || '',
      role: userProfile.role as UserRole,
      verified: userProfile.verified,
      premiumUntil: userProfile.premium_until || undefined,
      createdAt: userProfile.created_at,
    };
  },

  // Verify phone number with SMS code
  verifyPhone: async (phone: string, code: string): Promise<boolean> => {
    // Note: Supabase doesn't have built-in SMS verification
    // You would need to integrate with a service like Twilio
    // For now, we'll just update the phone number
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Mock verification (always succeeds with code "123456")
    if (code !== "123456") {
      throw new Error('Invalid verification code');
    }

    const { error } = await supabase
      .from('users')
      .update({
        phone,
        verified: true,
      })
      .eq('id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },

  // Request SMS verification code
  requestVerificationCode: async (phone: string): Promise<boolean> => {
    // Note: This would integrate with an SMS service like Twilio
    // For now, we'll just return true
    return true;
  },

  // Reset password
  resetPassword: async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      throw new Error(error.message);
    }

    return true;
  },

  // Set user as premium (admin function)
  setPremium: async (userId: string, duration: number): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if current user is admin
    const { data: currentUserProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (currentUserProfile?.role !== 'admin') {
      throw new Error('Unauthorized: Admin privileges required');
    }

    // Calculate premium expiration date
    const premiumUntil = new Date();
    premiumUntil.setDate(premiumUntil.getDate() + duration);

    const { data: userProfile, error } = await supabase
      .from('users')
      .update({
        role: 'premium',
        premium_until: premiumUntil.toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone || '',
      role: userProfile.role as UserRole,
      verified: userProfile.verified,
      premiumUntil: userProfile.premium_until || undefined,
      createdAt: userProfile.created_at,
    };
  },
};