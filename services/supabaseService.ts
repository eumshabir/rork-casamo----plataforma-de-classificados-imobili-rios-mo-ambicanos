import { supabase, supabaseHelper } from '@/lib/supabase';
import { User, UserRole } from '@/types/user';
import { Property, PropertyFilter } from '@/types/property';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth service with Supabase
export const supabaseAuthService = {
  // Email & Password Login
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      const { session, user } = await supabaseHelper.auth.signInWithPassword(email, password);
      
      if (!session || !user) {
        throw new Error('Login failed');
      }
      
      // Get additional user data from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      // Combine auth user and profile data
      const userData: User = {
        id: user.id,
        name: profile.name || user.user_metadata?.name || '',
        email: user.email || '',
        phone: profile.phone || user.user_metadata?.phone || '',
        role: profile.role || 'user',
        verified: profile.verified || false,
        premiumUntil: profile.premiumUntil || null,
        createdAt: profile.createdAt || user.created_at,
      };
      
      // Store user data
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      return { 
        user: userData, 
        token: session.access_token 
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },
  
  // Register new user
  register: async (userData: Partial<User>, password: string): Promise<{ user: User; token: string }> => {
    try {
      // Register with Supabase Auth
      const { session, user } = await supabaseHelper.auth.signUp(
        userData.email || '', 
        password,
        {
          name: userData.name,
          phone: userData.phone,
        }
      );
      
      if (!user) {
        throw new Error('Registration failed');
      }
      
      // Create user profile in the users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: 'user',
          verified: false,
          createdAt: new Date().toISOString(),
        })
        .select()
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      const newUser: User = {
        id: user.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        verified: profile.verified,
        createdAt: profile.createdAt,
      };
      
      // Store user data
      await AsyncStorage.setItem('user_data', JSON.stringify(newUser));
      
      return { 
        user: newUser, 
        token: session?.access_token || '' 
      };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  },
  
  // Google OAuth login
  loginWithGoogle: async (): Promise<{ user: User; token: string }> => {
    try {
      const { session, user } = await supabaseHelper.auth.signInWithOAuth('google');
      
      if (!user) {
        throw new Error('Google login failed');
      }
      
      // Check if user exists in the profiles table
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      // If not, create a new profile
      if (!existingProfile) {
        await supabase
          .from('users')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || '',
            email: user.email,
            role: 'user',
            verified: true, // Google accounts are considered verified
            createdAt: user.created_at,
          });
      }
      
      // Get the latest profile data
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      const userData: User = {
        id: user.id,
        name: profile.name || user.user_metadata?.name || '',
        email: user.email || '',
        phone: profile.phone || '',
        role: profile.role || 'user',
        verified: profile.verified || true,
        premiumUntil: profile.premiumUntil || null,
        createdAt: profile.createdAt || user.created_at,
      };
      
      // Store user data
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      return { 
        user: userData, 
        token: session?.access_token || '' 
      };
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  },
  
  // Facebook OAuth login
  loginWithFacebook: async (): Promise<{ user: User; token: string }> => {
    try {
      const { session, user } = await supabaseHelper.auth.signInWithOAuth('facebook');
      
      if (!user) {
        throw new Error('Facebook login failed');
      }
      
      // Check if user exists in the profiles table
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      // If not, create a new profile
      if (!existingProfile) {
        await supabase
          .from('users')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || '',
            email: user.email,
            role: 'user',
            verified: true, // Facebook accounts are considered verified
            createdAt: user.created_at,
          });
      }
      
      // Get the latest profile data
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      const userData: User = {
        id: user.id,
        name: profile.name || user.user_metadata?.name || '',
        email: user.email || '',
        phone: profile.phone || '',
        role: profile.role || 'user',
        verified: profile.verified || true,
        premiumUntil: profile.premiumUntil || null,
        createdAt: profile.createdAt || user.created_at,
      };
      
      // Store user data
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      return { 
        user: userData, 
        token: session?.access_token || '' 
      };
    } catch (error: any) {
      throw new Error(error.message || 'Facebook login failed');
    }
  },
  
  // Logout
  logout: async (): Promise<void> => {
    try {
      await supabaseHelper.auth.signOut();
      await AsyncStorage.removeItem('user_data');
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const session = await supabaseHelper.auth.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  },
  
  // Get current user data
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const user = await supabaseHelper.auth.getCurrentUser();
      
      if (!user) {
        return null;
      }
      
      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      const userData: User = {
        id: user.id,
        name: profile.name || user.user_metadata?.name || '',
        email: user.email || '',
        phone: profile.phone || '',
        role: profile.role || 'user',
        verified: profile.verified || false,
        premiumUntil: profile.premiumUntil || null,
        createdAt: profile.createdAt || user.created_at,
      };
      
      // Update stored user data
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      // Try to get from local storage as fallback
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
  },
  
  // Update user profile
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    try {
      const user = await supabaseHelper.auth.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update profile in the users table
      const { data: updatedProfile, error: profileError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      const userData: User = {
        id: user.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        role: updatedProfile.role,
        verified: updatedProfile.verified,
        premiumUntil: updatedProfile.premiumUntil,
        createdAt: updatedProfile.createdAt,
      };
      
      // Update stored user data
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  },
  
  // Upgrade to premium
  upgradeToPremium: async (planId: string, paymentMethod: string, phoneNumber: string): Promise<User> => {
    try {
      const user = await supabaseHelper.auth.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get plan details
      const { data: plan, error: planError } = await supabase
        .from('settings')
        .select('*')
        .single();
        
      if (planError) {
        throw planError;
      }
      
      // Calculate premium expiration date based on plan
      const premiumUntil = new Date();
      if (planId === 'monthly') {
        premiumUntil.setMonth(premiumUntil.getMonth() + 1);
      } else if (planId === 'quarterly') {
        premiumUntil.setMonth(premiumUntil.getMonth() + 3);
      } else if (planId === 'yearly') {
        premiumUntil.setFullYear(premiumUntil.getFullYear() + 1);
      } else {
        throw new Error('Invalid plan');
      }
      
      // Update user to premium
      const { data: updatedProfile, error: profileError } = await supabase
        .from('users')
        .update({
          role: 'premium',
          premiumUntil: premiumUntil.toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      // Record payment
      await supabase
        .from('payments')
        .insert({
          userId: user.id,
          amount: planId === 'monthly' 
            ? plan.premiumMonthlyPrice 
            : planId === 'quarterly' 
              ? plan.premiumQuarterlyPrice 
              : plan.premiumYearlyPrice,
          currency: plan.currency,
          method: paymentMethod,
          status: 'completed',
          description: `Premium subscription (${planId})`,
          createdAt: new Date().toISOString(),
        });
      
      const userData: User = {
        id: user.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        role: updatedProfile.role,
        verified: updatedProfile.verified,
        premiumUntil: updatedProfile.premiumUntil,
        createdAt: updatedProfile.createdAt,
      };
      
      // Update stored user data
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Premium upgrade failed');
    }
  },
  
  // Verify phone number with SMS code
  verifyPhone: async (phone: string, code: string): Promise<boolean> => {
    try {
      // In a real app, you would verify the SMS code with a service like Twilio
      // For now, we'll just update the user's verified status
      const user = await supabaseHelper.auth.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update user's phone and verified status
      const { error } = await supabase
        .from('users')
        .update({
          phone,
          verified: true,
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Phone verification failed');
    }
  },
  
  // Request SMS verification code
  requestVerificationCode: async (phone: string): Promise<boolean> => {
    try {
      // In a real app, you would send an SMS with a service like Twilio
      // For now, we'll just return success
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send verification code');
    }
  },
  
  // Reset password
  resetPassword: async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  },
  
  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      // First verify the current password by trying to sign in
      const user = await supabaseHelper.auth.getCurrentUser();
      
      if (!user || !user.email) {
        throw new Error('User not authenticated');
      }
      
      // Try to sign in with current password
      await supabaseHelper.auth.signInWithPassword(user.email, currentPassword);
      
      // If successful, update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Password change failed');
    }
  },
};

// Property service with Supabase
export const supabasePropertyService = {
  // Get all properties with optional filters
  getProperties: async (filter?: PropertyFilter): Promise<Property[]> => {
    try {
      return await supabaseHelper.db.getProperties(filter);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get properties');
    }
  },
  
  // Get featured properties
  getFeaturedProperties: async (): Promise<Property[]> => {
    try {
      return await supabaseHelper.db.getFeaturedProperties();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get featured properties');
    }
  },
  
  // Get user's properties
  getUserProperties: async (): Promise<Property[]> => {
    try {
      const user = await supabaseHelper.auth.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      return await supabaseHelper.db.getUserProperties(user.id);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user properties');
    }
  },
  
  // Get a single property by ID
  getProperty: async (id: string): Promise<Property> => {
    try {
      return await supabaseHelper.db.getProperty(id);
    } catch (error: any) {
      throw new Error(error.message || 'Property not found');
    }
  },
  
  // Create a new property
  createProperty: async (propertyData: Omit<Property, 'id' | 'createdAt' | 'views'>): Promise<Property> => {
    try {
      const user = await supabaseHelper.auth.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Check if user is allowed to create more properties
      if (propertyData.images && propertyData.images.length > 0) {
        // Upload images first
        const imagePromises = propertyData.images.map(async (image, index) => {
          const path = `${user.id}/${Date.now()}-${index}`;
          const data = await supabaseHelper.db.uploadPropertyImage(image.file, path);
          return {
            url: supabaseHelper.db.getImageUrl(data.path),
            order: index,
          };
        });
        
        const uploadedImages = await Promise.all(imagePromises);
        
        // Create property without images first
        const { images, ...propertyWithoutImages } = propertyData;
        const newProperty = await supabaseHelper.db.createProperty({
          ...propertyWithoutImages,
          userId: user.id,
          createdAt: new Date().toISOString(),
          views: 0,
        });
        
        // Then add images
        for (const image of uploadedImages) {
          await supabase
            .from('property_images')
            .insert({
              propertyId: newProperty.id,
              url: image.url,
              order: image.order,
              createdAt: new Date().toISOString(),
            });
        }
        
        // Get the complete property with images
        return await supabaseHelper.db.getProperty(newProperty.id);
      } else {
        // Create property without images
        return await supabaseHelper.db.createProperty({
          ...propertyData,
          userId: user.id,
          createdAt: new Date().toISOString(),
          views: 0,
        });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create property');
    }
  },
  
  // Update an existing property
  updateProperty: async (id: string, updates: Partial<Property>): Promise<Property> => {
    try {
      const user = await supabaseHelper.auth.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Check if property belongs to user
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('userId')
        .eq('id', id)
        .single();
        
      if (propertyError) {
        throw propertyError;
      }
      
      if (property.userId !== user.id) {
        throw new Error('You do not have permission to update this property');
      }
      
      // Handle image updates if any
      if (updates.images && updates.images.length > 0) {
        // Delete existing images
        await supabase
          .from('property_images')
          .delete()
          .eq('propertyId', id);
        
        // Upload new images
        const imagePromises = updates.images.map(async (image, index) => {
          if (image.file) {
            const path = `${user.id}/${Date.now()}-${index}`;
            const data = await supabaseHelper.db.uploadPropertyImage(image.file, path);
            return {
              url: supabaseHelper.db.getImageUrl(data.path),
              order: index,
            };
          } else {
            // Image already exists
            return {
              url: image.url,
              order: index,
            };
          }
        });
        
        const uploadedImages = await Promise.all(imagePromises);
        
        // Add new images
        for (const image of uploadedImages) {
          await supabase
            .from('property_images')
            .insert({
              propertyId: id,
              url: image.url,
              order: image.order,
              createdAt: new Date().toISOString(),
            });
        }
        
        // Remove images from updates
        const { images, ...updatesWithoutImages } = updates;
        
        // Update property
        await supabaseHelper.db.updateProperty(id, updatesWithoutImages);
      } else {
        // Update property without changing images
        await supabaseHelper.db.updateProperty(id, updates);
      }
      
      // Get the updated property
      return await supabaseHelper.db.getProperty(id);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update property');
    }
  },
  
  // Delete a property
  deleteProperty: async (id: string): Promise<boolean> => {
    try {
      const user = await supabaseHelper.auth.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Check if property belongs to user
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('userId')
        .eq('id', id)
        .single();
        
      if (propertyError) {
        throw propertyError;
      }
      
      if (property.userId !== user.id) {
        throw new Error('You do not have permission to delete this property');
      }
      
      // Delete property (cascade will delete images)
      return await supabaseHelper.db.deleteProperty(id);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete property');
    }
  },
  
  // Upload property images
  uploadPropertyImages: async (propertyId: string, images: FormData): Promise<string[]> => {
    try {
      const user = await supabaseHelper.auth.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Check if property belongs to user
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('userId')
        .eq('id', propertyId)
        .single();
        
      if (propertyError) {
        throw propertyError;
      }
      
      if (property.userId !== user.id) {
        throw new Error('You do not have permission to upload images to this property');
      }
      
      // Get the image files from FormData
      const imageFiles = images.getAll('images');
      
      // Upload images
      const imagePromises = Array.from(imageFiles).map(async (file: any, index) => {
        const path = `${user.id}/${propertyId}/${Date.now()}-${index}`;
        const data = await supabaseHelper.db.uploadPropertyImage(file, path);
        const url = supabaseHelper.db.getImageUrl(data.path);
        
        // Add image to property_images table
        await supabase
          .from('property_images')
          .insert({
            propertyId,
            url,
            order: index,
            createdAt: new Date().toISOString(),
          });
        
        return url;
      });
      
      return await Promise.all(imagePromises);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload images');
    }
  },
  
  // Get property statistics
  getPropertyStats: async (propertyId: string): Promise<any> => {
    try {
      // Get views
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('views')
        .eq('id', propertyId)
        .single();
        
      if (propertyError) {
        throw propertyError;
      }
      
      // Get favorites count
      const { count: favoritesCount, error: favoritesError } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('propertyId', propertyId);
        
      if (favoritesError) {
        throw favoritesError;
      }
      
      // Get contacts count (messages)
      const { count: contactsCount, error: contactsError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('propertyId', propertyId);
        
      if (contactsError) {
        throw contactsError;
      }
      
      return {
        views: property.views,
        contacts: contactsCount,
        favorites: favoritesCount,
        lastViewedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get property statistics');
    }
  },
  
  // Search properties
  searchProperties: async (query: string): Promise<Property[]> => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, images(*)')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);
        
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Search failed');
    }
  },
  
  // Add property to favorites
  addToFavorites: async (propertyId: string): Promise<boolean> => {
    try {
      const user = await supabaseHelper.auth.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      return await supabaseHelper.db.addToFavorites(user.id, propertyId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add to favorites');
    }
  },
  
  // Remove property from favorites
  removeFromFavorites: async (propertyId: string): Promise<boolean> => {
    try {
      const user = await supabaseHelper.auth.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      return await supabaseHelper.db.removeFromFavorites(user.id, propertyId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to remove from favorites');
    }
  },
  
  // Get user's favorite properties
  getFavorites: async (): Promise<Property[]> => {
    try {
      const user = await supabaseHelper.auth.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      return await supabaseHelper.db.getFavorites(user.id);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get favorites');
    }
  },
  
  // Boost a property
  boostProperty: async (propertyId: string, boostOptionId: string, paymentMethod: string, phoneNumber: string): Promise<any> => {
    try {
      const user = await supabaseHelper.auth.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Check if property belongs to user
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('userId')
        .eq('id', propertyId)
        .single();
        
      if (propertyError) {
        throw propertyError;
      }
      
      if (property.userId !== user.id) {
        throw new Error('You do not have permission to boost this property');
      }
      
      // Get boost option details
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .single();
        
      if (settingsError) {
        throw settingsError;
      }
      
      // Calculate boost expiration date
      const boostedUntil = new Date();
      let boostPrice = 0;
      
      if (boostOptionId === '7days') {
        boostedUntil.setDate(boostedUntil.getDate() + 7);
        boostPrice = settings.boost7DaysPrice;
      } else if (boostOptionId === '15days') {
        boostedUntil.setDate(boostedUntil.getDate() + 15);
        boostPrice = settings.boost15DaysPrice;
      } else if (boostOptionId === '30days') {
        boostedUntil.setDate(boostedUntil.getDate() + 30);
        boostPrice = settings.boost30DaysPrice;
      } else {
        throw new Error('Invalid boost option');
      }
      
      // Update property to featured
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          featured: true,
          boostedUntil: boostedUntil.toISOString(),
        })
        .eq('id', propertyId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Record payment
      await supabase
        .from('payments')
        .insert({
          userId: user.id,
          amount: boostPrice,
          currency: settings.currency,
          method: paymentMethod,
          status: 'completed',
          description: `Property boost (${boostOptionId})`,
          createdAt: new Date().toISOString(),
        });
      
      return {
        success: true,
        message: "Imóvel destacado com sucesso",
        expiresAt: boostedUntil.toISOString(),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Boost failed');
    }
  },
};