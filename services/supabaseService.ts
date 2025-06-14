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
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          const newProfile = {
            id: user.id,
            name: user.user_metadata?.name || '',
            email: user.email,
            phone: user.user_metadata?.phone || '',
            role: 'user' as UserRole,
            verified: false,
            created_at: new Date().toISOString(),
          };
          
          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .insert(newProfile)
            .select()
            .single();
            
          if (createError) throw createError;
          
          const userData: User = {
            id: user.id,
            name: createdProfile.name,
            email: createdProfile.email,
            phone: createdProfile.phone,
            role: createdProfile.role,
            verified: createdProfile.verified,
            premiumUntil: createdProfile.premium_until,
            createdAt: createdProfile.created_at,
          };
          
          // Store user data
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
          
          return { 
            user: userData, 
            token: session.access_token 
          };
        } else {
          throw profileError;
        }
      }
      
      // Combine auth user and profile data
      const userData: User = {
        id: user.id,
        name: profile.name || user.user_metadata?.name || '',
        email: user.email || '',
        phone: profile.phone || user.user_metadata?.phone || '',
        role: profile.role || 'user',
        verified: profile.verified || false,
        premiumUntil: profile.premium_until || null,
        createdAt: profile.created_at || user.created_at,
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
          created_at: new Date().toISOString(),
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
        createdAt: profile.created_at,
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
      const response = await supabaseHelper.auth.signInWithOAuth('google');
      
      // Handle the OAuth flow
      // In a real app, you would handle the redirect and get the session
      // For now, we'll just get the current session after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw sessionError || new Error('Failed to get session after Google login');
      }
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw userError || new Error('Failed to get user after Google login');
      }
      
      const user = userData.user;
      
      // Check if user exists in the profiles table
      const { data: existingProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
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
            created_at: new Date().toISOString(),
          });
      }
      
      // Get the latest profile data
      const { data: profile, error: getProfileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (getProfileError) {
        throw getProfileError;
      }
      
      const userInfo: User = {
        id: user.id,
        name: profile.name || user.user_metadata?.name || '',
        email: user.email || '',
        phone: profile.phone || '',
        role: profile.role || 'user',
        verified: profile.verified || true,
        premiumUntil: profile.premium_until || null,
        createdAt: profile.created_at || user.created_at,
      };
      
      // Store user data
      await AsyncStorage.setItem('user_data', JSON.stringify(userInfo));
      
      return { 
        user: userInfo, 
        token: sessionData.session.access_token
      };
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  },
  
  // Facebook OAuth login
  loginWithFacebook: async (): Promise<{ user: User; token: string }> => {
    try {
      const response = await supabaseHelper.auth.signInWithOAuth('facebook');
      
      // Handle the OAuth flow
      // In a real app, you would handle the redirect and get the session
      // For now, we'll just get the current session after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw sessionError || new Error('Failed to get session after Facebook login');
      }
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw userError || new Error('Failed to get user after Facebook login');
      }
      
      const user = userData.user;
      
      // Check if user exists in the profiles table
      const { data: existingProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
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
            created_at: new Date().toISOString(),
          });
      }
      
      // Get the latest profile data
      const { data: profile, error: getProfileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (getProfileError) {
        throw getProfileError;
      }
      
      const userInfo: User = {
        id: user.id,
        name: profile.name || user.user_metadata?.name || '',
        email: user.email || '',
        phone: profile.phone || '',
        role: profile.role || 'user',
        verified: profile.verified || true,
        premiumUntil: profile.premium_until || null,
        createdAt: profile.created_at || user.created_at,
      };
      
      // Store user data
      await AsyncStorage.setItem('user_data', JSON.stringify(userInfo));
      
      return { 
        user: userInfo, 
        token: sessionData.session.access_token
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
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          const newProfile = {
            id: user.id,
            name: user.user_metadata?.name || '',
            email: user.email,
            phone: user.user_metadata?.phone || '',
            role: 'user' as UserRole,
            verified: false,
            created_at: new Date().toISOString(),
          };
          
          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .insert(newProfile)
            .select()
            .single();
            
          if (createError) throw createError;
          
          const userData: User = {
            id: user.id,
            name: createdProfile.name,
            email: createdProfile.email,
            phone: createdProfile.phone,
            role: createdProfile.role,
            verified: createdProfile.verified,
            premiumUntil: createdProfile.premium_until,
            createdAt: createdProfile.created_at,
          };
          
          // Update stored user data
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
          
          return userData;
        } else {
          throw profileError;
        }
      }
      
      const userData: User = {
        id: user.id,
        name: profile.name || user.user_metadata?.name || '',
        email: user.email || '',
        phone: profile.phone || '',
        role: profile.role || 'user',
        verified: profile.verified || false,
        premiumUntil: profile.premium_until || null,
        createdAt: profile.created_at || user.created_at,
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
      
      // Convert camelCase to snake_case for Supabase
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.role) dbUpdates.role = updates.role;
      if (updates.verified !== undefined) dbUpdates.verified = updates.verified;
      if (updates.premiumUntil) dbUpdates.premium_until = updates.premiumUntil;
      
      // Update profile in the users table
      const { data: updatedProfile, error: profileError } = await supabase
        .from('users')
        .update(dbUpdates)
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
        premiumUntil: updatedProfile.premium_until,
        createdAt: updatedProfile.created_at,
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
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .single();
        
      if (settingsError) {
        // If settings don't exist, create default settings
        if (settingsError.code === 'PGRST116') {
          const defaultSettings = {
            id: 'settings',
            premium_monthly_price: 1500,
            premium_quarterly_price: 4000,
            premium_yearly_price: 15000,
            boost_7days_price: 500,
            boost_15days_price: 900,
            boost_30days_price: 1600,
            currency: 'MZN',
            max_images_per_property: 10,
            max_properties_for_free_users: 3
          };
          
          const { data: createdSettings, error: createError } = await supabase
            .from('settings')
            .insert(defaultSettings)
            .select()
            .single();
            
          if (createError) throw createError;
        }
      }
      
      const plan = settings || {
        premium_monthly_price: 1500,
        premium_quarterly_price: 4000,
        premium_yearly_price: 15000,
        currency: 'MZN'
      };
      
      // Calculate premium expiration date based on plan
      const premiumUntil = new Date();
      let amount = 0;
      
      if (planId === 'monthly') {
        premiumUntil.setMonth(premiumUntil.getMonth() + 1);
        amount = plan.premium_monthly_price;
      } else if (planId === 'quarterly') {
        premiumUntil.setMonth(premiumUntil.getMonth() + 3);
        amount = plan.premium_quarterly_price;
      } else if (planId === 'yearly') {
        premiumUntil.setFullYear(premiumUntil.getFullYear() + 1);
        amount = plan.premium_yearly_price;
      } else {
        throw new Error('Invalid plan');
      }
      
      // Update user to premium
      const { data: updatedProfile, error: profileError } = await supabase
        .from('users')
        .update({
          role: 'premium',
          premium_until: premiumUntil.toISOString(),
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
          user_id: user.id,
          amount: amount,
          currency: plan.currency,
          method: paymentMethod,
          status: 'completed',
          description: `Premium subscription (${planId})`,
          created_at: new Date().toISOString(),
        });
      
      const userData: User = {
        id: user.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        role: updatedProfile.role,
        verified: updatedProfile.verified,
        premiumUntil: updatedProfile.premium_until,
        createdAt: updatedProfile.created_at,
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
      let query = supabase.from('properties').select('*, images(*)');
      
      // Apply filters if provided
      if (filter) {
        if (filter.type) query = query.eq('type', filter.type);
        if (filter.listingType) query = query.eq('listing_type', filter.listingType);
        if (filter.province) query = query.eq('province', filter.province);
        if (filter.city) query = query.eq('city', filter.city);
        if (filter.minPrice) query = query.gte('price', filter.minPrice);
        if (filter.maxPrice) query = query.lte('price', filter.maxPrice);
        if (filter.minBedrooms) query = query.gte('bedrooms', filter.minBedrooms);
        if (filter.minBathrooms) query = query.gte('bathrooms', filter.minBathrooms);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Transform data to match our Property type
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency || 'MZN',
        type: item.type,
        listingType: item.listing_type,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        area: item.area,
        featured: item.featured,
        boostedUntil: item.boosted_until,
        views: item.views,
        location: {
          province: item.province,
          city: item.city,
          neighborhood: item.neighborhood,
          district: item.district,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
        },
        images: item.images ? item.images.map((img: any) => img.url) : [],
        amenities: [], // We'll need to fetch these separately or join in the query
        createdAt: item.created_at,
        owner: {
          id: item.user_id,
          name: 'Owner', // We'll need to fetch this separately
          phone: '', // We'll need to fetch this separately
          isPremium: false // We'll need to fetch this separately
        },
        userId: item.user_id
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get properties');
    }
  },
  
  // Get featured properties
  getFeaturedProperties: async (): Promise<Property[]> => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, images(*)')
        .eq('featured', true);
      
      if (error) {
        throw error;
      }
      
      // Transform data to match our Property type
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency || 'MZN',
        type: item.type,
        listingType: item.listing_type,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        area: item.area,
        featured: item.featured,
        boostedUntil: item.boosted_until,
        views: item.views,
        location: {
          province: item.province,
          city: item.city,
          neighborhood: item.neighborhood,
          district: item.district,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
        },
        images: item.images ? item.images.map((img: any) => img.url) : [],
        amenities: [], // We'll need to fetch these separately or join in the query
        createdAt: item.created_at,
        owner: {
          id: item.user_id,
          name: 'Owner', // We'll need to fetch this separately
          phone: '', // We'll need to fetch this separately
          isPremium: false // We'll need to fetch this separately
        },
        userId: item.user_id
      }));
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
      
      const { data, error } = await supabase
        .from('properties')
        .select('*, images(*)')
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Transform data to match our Property type
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency || 'MZN',
        type: item.type,
        listingType: item.listing_type,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        area: item.area,
        featured: item.featured,
        boostedUntil: item.boosted_until,
        views: item.views,
        location: {
          province: item.province,
          city: item.city,
          neighborhood: item.neighborhood,
          district: item.district,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
        },
        images: item.images ? item.images.map((img: any) => img.url) : [],
        amenities: [], // We'll need to fetch these separately or join in the query
        createdAt: item.created_at,
        owner: {
          id: user.id,
          name: user.user_metadata?.name || '',
          phone: user.user_metadata?.phone || '',
          isPremium: false // We'll need to determine this
        },
        userId: user.id
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user properties');
    }
  },
  
  // Get a single property by ID
  getProperty: async (id: string): Promise<Property> => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, images(*), property_amenities(*)')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Get amenities
      const amenities = data.property_amenities ? 
        data.property_amenities.map((amenity: any) => amenity.name) : 
        [];
      
      // Get owner info
      const { data: ownerData, error: ownerError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user_id)
        .single();
        
      if (ownerError && ownerError.code !== 'PGRST116') {
        throw ownerError;
      }
      
      const owner = ownerData || {
        id: data.user_id,
        name: 'Owner',
        phone: '',
        role: 'user'
      };
      
      // Transform data to match our Property type
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency || 'MZN',
        type: data.type,
        listingType: data.listing_type,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        featured: data.featured,
        boostedUntil: data.boosted_until,
        views: data.views,
        location: {
          province: data.province,
          city: data.city,
          neighborhood: data.neighborhood,
          district: data.district,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
        },
        images: data.images ? data.images.map((img: any) => img.url) : [],
        amenities,
        createdAt: data.created_at,
        owner: {
          id: owner.id,
          name: owner.name,
          phone: owner.phone || '',
          isPremium: owner.role === 'premium'
        },
        userId: data.user_id
      };
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
      const { data: userProperties, error: countError } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', user.id);
      
      if (countError) {
        throw countError;
      }
      
      // Get settings
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('max_properties_for_free_users')
        .single();
      
      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }
      
      const maxProperties = settings?.max_properties_for_free_users || 3;
      
      // Check if user is premium or has not reached the limit
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, premium_until')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        throw userError;
      }
      
      const isPremium = userData.role === 'premium' && 
        (userData.premium_until ? new Date(userData.premium_until) > new Date() : false);
      
      if (!isPremium && userProperties.length >= maxProperties) {
        throw new Error(`Free users can only create ${maxProperties} properties. Upgrade to premium for unlimited properties.`);
      }
      
      // Prepare property data for Supabase
      const { location, images, amenities, owner, ...rest } = propertyData;
      
      const dbPropertyData = {
        ...rest,
        province: location.province,
        city: location.city,
        neighborhood: location.neighborhood || null,
        district: location.district || null,
        address: location.address || null,
        latitude: location.latitude || null,
        longitude: location.longitude || null,
        user_id: user.id,
        created_at: new Date().toISOString(),
        views: 0,
        listing_type: propertyData.listingType,
        currency: propertyData.currency || 'MZN'
      };
      
      // Create property
      const { data: newProperty, error: propertyError } = await supabase
        .from('properties')
        .insert(dbPropertyData)
        .select()
        .single();
      
      if (propertyError) {
        throw propertyError;
      }
      
      // Add amenities if any
      if (amenities && amenities.length > 0) {
        const amenityData = amenities.map(name => ({
          name,
          property_id: newProperty.id,
        }));
        
        const { error: amenitiesError } = await supabase
          .from('property_amenities')
          .insert(amenityData);
        
        if (amenitiesError) {
          throw amenitiesError;
        }
      }
      
      // Add images if any
      if (images && images.length > 0) {
        // In a real app, you would upload the images to storage first
        // For now, we'll just use the URLs directly
        const imageData = images.map((imageUrl, index) => ({
          url: imageUrl,
          order: index,
          property_id: newProperty.id,
          created_at: new Date().toISOString(),
        }));
        
        const { error: imagesError } = await supabase
          .from('property_images')
          .insert(imageData);
        
        if (imagesError) {
          throw imagesError;
        }
      }
      
      // Get the complete property with images and amenities
      return await this.getProperty(newProperty.id);
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
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (propertyError) {
        throw propertyError;
      }
      
      if (property.user_id !== user.id) {
        throw new Error('You do not have permission to update this property');
      }
      
      // Prepare updates for Supabase
      const dbUpdates: any = {};
      
      // Copy simple fields
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.listingType !== undefined) dbUpdates.listing_type = updates.listingType;
      if (updates.bedrooms !== undefined) dbUpdates.bedrooms = updates.bedrooms;
      if (updates.bathrooms !== undefined) dbUpdates.bathrooms = updates.bathrooms;
      if (updates.area !== undefined) dbUpdates.area = updates.area;
      if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
      if (updates.boostedUntil !== undefined) dbUpdates.boosted_until = updates.boostedUntil;
      
      // Handle location updates
      if (updates.location) {
        if (updates.location.province !== undefined) dbUpdates.province = updates.location.province;
        if (updates.location.city !== undefined) dbUpdates.city = updates.location.city;
        if (updates.location.neighborhood !== undefined) dbUpdates.neighborhood = updates.location.neighborhood;
        if (updates.location.district !== undefined) dbUpdates.district = updates.location.district;
        if (updates.location.address !== undefined) dbUpdates.address = updates.location.address;
        if (updates.location.latitude !== undefined) dbUpdates.latitude = updates.location.latitude;
        if (updates.location.longitude !== undefined) dbUpdates.longitude = updates.location.longitude;
      }
      
      // Update property
      const { error: updateError } = await supabase
        .from('properties')
        .update(dbUpdates)
        .eq('id', id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Handle amenities updates
      if (updates.amenities) {
        // Delete existing amenities
        const { error: deleteAmenitiesError } = await supabase
          .from('property_amenities')
          .delete()
          .eq('property_id', id);
        
        if (deleteAmenitiesError) {
          throw deleteAmenitiesError;
        }
        
        // Add new amenities
        if (updates.amenities.length > 0) {
          const amenityData = updates.amenities.map(name => ({
            name,
            property_id: id,
          }));
          
          const { error: amenitiesError } = await supabase
            .from('property_amenities')
            .insert(amenityData);
          
          if (amenitiesError) {
            throw amenitiesError;
          }
        }
      }
      
      // Handle images updates
      if (updates.images) {
        // Delete existing images
        const { error: deleteImagesError } = await supabase
          .from('property_images')
          .delete()
          .eq('property_id', id);
        
        if (deleteImagesError) {
          throw deleteImagesError;
        }
        
        // Add new images
        if (updates.images.length > 0) {
          const imageData = updates.images.map((imageUrl, index) => ({
            url: imageUrl,
            order: index,
            property_id: id,
            created_at: new Date().toISOString(),
          }));
          
          const { error: imagesError } = await supabase
            .from('property_images')
            .insert(imageData);
          
          if (imagesError) {
            throw imagesError;
          }
        }
      }
      
      // Get the updated property
      return await this.getProperty(id);
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
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (propertyError) {
        throw propertyError;
      }
      
      if (property.user_id !== user.id) {
        throw new Error('You do not have permission to delete this property');
      }
      
      // Delete property (cascade will delete images and amenities)
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      return true;
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
        .select('user_id')
        .eq('id', propertyId)
        .single();
      
      if (propertyError) {
        throw propertyError;
      }
      
      if (property.user_id !== user.id) {
        throw new Error('You do not have permission to upload images to this property');
      }
      
      // Get the image files from FormData
      const imageFiles = images.getAll('images');
      
      // Upload images
      const imageUrls: string[] = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i] as any;
        const path = `${user.id}/${propertyId}/${Date.now()}-${i}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(path, file);
        
        if (error) {
          throw error;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(data.path);
        
        const url = urlData.publicUrl;
        imageUrls.push(url);
        
        // Add image to property_images table
        await supabase
          .from('property_images')
          .insert({
            property_id: propertyId,
            url,
            order: i,
            created_at: new Date().toISOString(),
          });
      }
      
      return imageUrls;
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
        .eq('property_id', propertyId);
      
      if (favoritesError) {
        throw favoritesError;
      }
      
      // Get contacts count (messages)
      const { count: contactsCount, error: contactsError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId);
      
      if (contactsError && contactsError.code !== 'PGRST116') {
        throw contactsError;
      }
      
      return {
        views: property.views,
        contacts: contactsCount || 0,
        favorites: favoritesCount || 0,
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
      
      // Transform data to match our Property type
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency || 'MZN',
        type: item.type,
        listingType: item.listing_type,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        area: item.area,
        featured: item.featured,
        boostedUntil: item.boosted_until,
        views: item.views,
        location: {
          province: item.province,
          city: item.city,
          neighborhood: item.neighborhood,
          district: item.district,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
        },
        images: item.images ? item.images.map((img: any) => img.url) : [],
        amenities: [], // We'll need to fetch these separately or join in the query
        createdAt: item.created_at,
        owner: {
          id: item.user_id,
          name: 'Owner', // We'll need to fetch this separately
          phone: '', // We'll need to fetch this separately
          isPremium: false // We'll need to fetch this separately
        },
        userId: item.user_id
      }));
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
      
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          property_id: propertyId,
          created_at: new Date().toISOString(),
        });
      
      if (error) {
        // If already favorited, just return success
        if (error.code === '23505') {
          return true;
        }
        throw error;
      }
      
      return true;
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
      
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: user.id, property_id: propertyId });
      
      if (error) {
        throw error;
      }
      
      return true;
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
      
      const { data, error } = await supabase
        .from('favorites')
        .select('property:property_id(*)')
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Transform data to match our Property type
      return data.map((fav: any) => {
        const item = fav.property;
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          currency: item.currency || 'MZN',
          type: item.type,
          listingType: item.listing_type,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          area: item.area,
          featured: item.featured,
          boostedUntil: item.boosted_until,
          views: item.views,
          location: {
            province: item.province,
            city: item.city,
            neighborhood: item.neighborhood,
            district: item.district,
            address: item.address,
            latitude: item.latitude,
            longitude: item.longitude,
          },
          images: [], // We'll need to fetch these separately or join in the query
          amenities: [], // We'll need to fetch these separately or join in the query
          createdAt: item.created_at,
          owner: {
            id: item.user_id,
            name: 'Owner', // We'll need to fetch this separately
            phone: '', // We'll need to fetch this separately
            isPremium: false // We'll need to fetch this separately
          },
          userId: item.user_id
        };
      });
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
        .select('user_id')
        .eq('id', propertyId)
        .single();
      
      if (propertyError) {
        throw propertyError;
      }
      
      if (property.user_id !== user.id) {
        throw new Error('You do not have permission to boost this property');
      }
      
      // Get boost option details
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }
      
      // Use default settings if none exist
      const boostSettings = settings || {
        boost_7days_price: 500,
        boost_15days_price: 900,
        boost_30days_price: 1600,
        currency: 'MZN',
      };
      
      // Calculate boost expiration date
      const boostedUntil = new Date();
      let boostPrice = 0;
      
      if (boostOptionId === '7days') {
        boostedUntil.setDate(boostedUntil.getDate() + 7);
        boostPrice = boostSettings.boost_7days_price;
      } else if (boostOptionId === '15days') {
        boostedUntil.setDate(boostedUntil.getDate() + 15);
        boostPrice = boostSettings.boost_15days_price;
      } else if (boostOptionId === '30days') {
        boostedUntil.setDate(boostedUntil.getDate() + 30);
        boostPrice = boostSettings.boost_30days_price;
      } else {
        throw new Error('Invalid boost option');
      }
      
      // Update property to featured
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          featured: true,
          boosted_until: boostedUntil.toISOString(),
        })
        .eq('id', propertyId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Record payment
      await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: boostPrice,
          currency: boostSettings.currency,
          method: paymentMethod,
          status: 'completed',
          description: `Property boost (${boostOptionId})`,
          created_at: new Date().toISOString(),
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