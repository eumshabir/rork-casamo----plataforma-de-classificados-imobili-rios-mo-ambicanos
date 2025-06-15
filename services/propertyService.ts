import { supabase } from '@/lib/supabase';
import { Property, PropertyFilter } from '@/types/property';

export const propertyService = {
  // Get all properties with optional filters
  getProperties: async (filter?: PropertyFilter): Promise<Property[]> => {
    let query = supabase
      .from('properties')
      .select(`
        *,
        users!properties_user_id_fkey (
          id,
          name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filter?.type) {
      query = query.eq('type', filter.type);
    }

    if (filter?.listingType) {
      query = query.eq('listing_type', filter.listingType);
    }

    if (filter?.province) {
      query = query.eq('location_province', filter.province);
    }

    if (filter?.city) {
      query = query.eq('location_city', filter.city);
    }

    if (filter?.minPrice) {
      query = query.gte('price', filter.minPrice);
    }

    if (filter?.maxPrice) {
      query = query.lte('price', filter.maxPrice);
    }

    if (filter?.minBedrooms) {
      query = query.gte('bedrooms', filter.minBedrooms);
    }

    if (filter?.minBathrooms) {
      query = query.gte('bathrooms', filter.minBathrooms);
    }

    if (filter?.amenities && filter.amenities.length > 0) {
      query = query.contains('amenities', filter.amenities);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      type: property.type as Property['type'],
      listingType: property.listing_type as Property['listingType'],
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      location: {
        province: property.location_province,
        city: property.location_city,
        district: property.location_district || '',
        address: property.location_address || '',
        coordinates: property.location_coordinates as Property['location']['coordinates'],
      },
      images: property.images,
      amenities: property.amenities,
      featured: property.featured,
      views: property.views,
      createdAt: property.created_at,
      owner: {
        id: property.users.id,
        name: property.users.name,
        email: property.users.email,
        phone: property.users.phone || '',
      },
    }));
  },

  // Get featured properties
  getFeaturedProperties: async (): Promise<Property[]> => {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        users!properties_user_id_fkey (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      type: property.type as Property['type'],
      listingType: property.listing_type as Property['listingType'],
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      location: {
        province: property.location_province,
        city: property.location_city,
        district: property.location_district || '',
        address: property.location_address || '',
        coordinates: property.location_coordinates as Property['location']['coordinates'],
      },
      images: property.images,
      amenities: property.amenities,
      featured: property.featured,
      views: property.views,
      createdAt: property.created_at,
      owner: {
        id: property.users.id,
        name: property.users.name,
        email: property.users.email,
        phone: property.users.phone || '',
      },
    }));
  },

  // Get user's properties
  getUserProperties: async (): Promise<Property[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        users!properties_user_id_fkey (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      type: property.type as Property['type'],
      listingType: property.listing_type as Property['listingType'],
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      location: {
        province: property.location_province,
        city: property.location_city,
        district: property.location_district || '',
        address: property.location_address || '',
        coordinates: property.location_coordinates as Property['location']['coordinates'],
      },
      images: property.images,
      amenities: property.amenities,
      featured: property.featured,
      views: property.views,
      createdAt: property.created_at,
      owner: {
        id: property.users.id,
        name: property.users.name,
        email: property.users.email,
        phone: property.users.phone || '',
      },
    }));
  },

  // Get a single property by ID
  getProperty: async (id: string): Promise<Property> => {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        users!properties_user_id_fkey (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Increment view count
    await supabase
      .from('properties')
      .update({ views: data.views + 1 })
      .eq('id', id);

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      type: data.type as Property['type'],
      listingType: data.listing_type as Property['listingType'],
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      location: {
        province: data.location_province,
        city: data.location_city,
        district: data.location_district || '',
        address: data.location_address || '',
        coordinates: data.location_coordinates as Property['location']['coordinates'],
      },
      images: data.images,
      amenities: data.amenities,
      featured: data.featured,
      views: data.views + 1,
      createdAt: data.created_at,
      owner: {
        id: data.users.id,
        name: data.users.name,
        email: data.users.email,
        phone: data.users.phone || '',
      },
    };
  },

  // Create a new property
  createProperty: async (propertyData: Omit<Property, 'id' | 'createdAt' | 'views' | 'owner'>): Promise<Property> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('properties')
      .insert({
        user_id: user.id,
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price,
        type: propertyData.type,
        listing_type: propertyData.listingType,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        area: propertyData.area,
        location_province: propertyData.location.province,
        location_city: propertyData.location.city,
        location_district: propertyData.location.district,
        location_address: propertyData.location.address,
        location_coordinates: propertyData.location.coordinates,
        images: propertyData.images,
        amenities: propertyData.amenities,
        featured: propertyData.featured,
      })
      .select(`
        *,
        users!properties_user_id_fkey (
          id,
          name,
          email,
          phone
        )
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      type: data.type as Property['type'],
      listingType: data.listing_type as Property['listingType'],
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      location: {
        province: data.location_province,
        city: data.location_city,
        district: data.location_district || '',
        address: data.location_address || '',
        coordinates: data.location_coordinates as Property['location']['coordinates'],
      },
      images: data.images,
      amenities: data.amenities,
      featured: data.featured,
      views: data.views,
      createdAt: data.created_at,
      owner: {
        id: data.users.id,
        name: data.users.name,
        email: data.users.email,
        phone: data.users.phone || '',
      },
    };
  },

  // Update an existing property
  updateProperty: async (id: string, updates: Partial<Property>): Promise<Property> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData: any = {};
    
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.price) updateData.price = updates.price;
    if (updates.type) updateData.type = updates.type;
    if (updates.listingType) updateData.listing_type = updates.listingType;
    if (updates.bedrooms !== undefined) updateData.bedrooms = updates.bedrooms;
    if (updates.bathrooms !== undefined) updateData.bathrooms = updates.bathrooms;
    if (updates.area !== undefined) updateData.area = updates.area;
    if (updates.location) {
      if (updates.location.province) updateData.location_province = updates.location.province;
      if (updates.location.city) updateData.location_city = updates.location.city;
      if (updates.location.district) updateData.location_district = updates.location.district;
      if (updates.location.address) updateData.location_address = updates.location.address;
      if (updates.location.coordinates) updateData.location_coordinates = updates.location.coordinates;
    }
    if (updates.images) updateData.images = updates.images;
    if (updates.amenities) updateData.amenities = updates.amenities;
    if (updates.featured !== undefined) updateData.featured = updates.featured;

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        users!properties_user_id_fkey (
          id,
          name,
          email,
          phone
        )
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      type: data.type as Property['type'],
      listingType: data.listing_type as Property['listingType'],
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      location: {
        province: data.location_province,
        city: data.location_city,
        district: data.location_district || '',
        address: data.location_address || '',
        coordinates: data.location_coordinates as Property['location']['coordinates'],
      },
      images: data.images,
      amenities: data.amenities,
      featured: data.featured,
      views: data.views,
      createdAt: data.created_at,
      owner: {
        id: data.users.id,
        name: data.users.name,
        email: data.users.email,
        phone: data.users.phone || '',
      },
    };
  },

  // Delete a property
  deleteProperty: async (id: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },

  // Upload property images (placeholder - would integrate with Supabase Storage)
  uploadPropertyImages: async (propertyId: string, images: FormData): Promise<string[]> => {
    // Note: This would use Supabase Storage
    // For now, we'll return mock URLs
    const imageCount = images.getAll('images').length;
    return Array(imageCount)
      .fill(0)
      .map((_, i) => `https://images.unsplash.com/photo-${Date.now()}-${i}?w=800`);
  },

  // Get property statistics
  getPropertyStats: async (propertyId: string): Promise<any> => {
    const { data: property, error } = await supabase
      .from('properties')
      .select('views, created_at')
      .eq('id', propertyId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Get favorites count
    const { count: favoritesCount } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', propertyId);

    return {
      views: property.views,
      contacts: Math.floor(Math.random() * 20) + 1, // Mock data
      favorites: favoritesCount || 0,
      lastViewedAt: new Date().toISOString(),
    };
  },

  // Search properties
  searchProperties: async (query: string): Promise<Property[]> => {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        users!properties_user_id_fkey (
          id,
          name,
          email,
          phone
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      type: property.type as Property['type'],
      listingType: property.listing_type as Property['listingType'],
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      location: {
        province: property.location_province,
        city: property.location_city,
        district: property.location_district || '',
        address: property.location_address || '',
        coordinates: property.location_coordinates as Property['location']['coordinates'],
      },
      images: property.images,
      amenities: property.amenities,
      featured: property.featured,
      views: property.views,
      createdAt: property.created_at,
      owner: {
        id: property.users.id,
        name: property.users.name,
        email: property.users.email,
        phone: property.users.phone || '',
      },
    }));
  },

  // Toggle favorite
  toggleFavorite: async (propertyId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .single();

    if (existing) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) {
        throw new Error(error.message);
      }

      return false;
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          property_id: propertyId,
        });

      if (error) {
        throw new Error(error.message);
      }

      return true;
    }
  },

  // Get user's favorite properties
  getFavoriteProperties: async (): Promise<Property[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        properties (
          *,
          users!properties_user_id_fkey (
            id,
            name,
            email,
            phone
          )
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    return data.map(favorite => {
      const property = favorite.properties as any;
      return {
        id: property.id,
        title: property.title,
        description: property.description,
        price: property.price,
        type: property.type as Property['type'],
        listingType: property.listing_type as Property['listingType'],
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        location: {
          province: property.location_province,
          city: property.location_city,
          district: property.location_district || '',
          address: property.location_address || '',
          coordinates: property.location_coordinates as Property['location']['coordinates'],
        },
        images: property.images,
        amenities: property.amenities,
        featured: property.featured,
        views: property.views,
        createdAt: property.created_at,
        owner: {
          id: property.users.id,
          name: property.users.name,
          email: property.users.email,
          phone: property.users.phone || '',
        },
      };
    });
  },
};