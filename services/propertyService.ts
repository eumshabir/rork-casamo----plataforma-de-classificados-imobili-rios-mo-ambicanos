import { Property } from '@/types/property';
import { trpcClient } from '@/lib/trpc';

export const propertyService = {
  // Get all properties with optional filters
  getProperties: async (filters?: {
    type?: string;
    listingType?: string;
    province?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    minBathrooms?: number;
    amenities?: string[];
  }): Promise<Property[]> => {
    try {
      return await trpcClient.property.getProperties.query(filters);
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw new Error('Failed to fetch properties');
    }
  },
  
  // Get featured properties
  getFeaturedProperties: async (): Promise<Property[]> => {
    try {
      return await trpcClient.property.getFeaturedProperties.query();
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      throw new Error('Failed to fetch featured properties');
    }
  },
  
  // Get properties owned by the current user
  getUserProperties: async (): Promise<Property[]> => {
    try {
      return await trpcClient.property.getUserProperties.query();
    } catch (error) {
      console.error('Error fetching user properties:', error);
      throw new Error('Failed to fetch your properties');
    }
  },
  
  // Get property by ID
  getPropertyById: async (id: string): Promise<Property> => {
    try {
      return await trpcClient.property.getPropertyById.query({ id });
    } catch (error) {
      console.error('Error fetching property:', error);
      throw new Error('Failed to fetch property details');
    }
  },
  
  // Create a new property
  createProperty: async (propertyData: Omit<Property, 'id' | 'createdAt' | 'views' | 'owner'>): Promise<Property> => {
    try {
      return await trpcClient.property.createProperty.mutate({
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price,
        currency: propertyData.currency,
        type: propertyData.type,
        listingType: propertyData.listingType,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        area: propertyData.area,
        location: {
          province: propertyData.location.province,
          city: propertyData.location.city,
          neighborhood: propertyData.location.neighborhood,
          address: propertyData.location.address,
          coordinates: propertyData.location.coordinates,
        },
        amenities: propertyData.amenities,
        images: propertyData.images,
        featured: propertyData.featured,
      });
    } catch (error) {
      console.error('Error creating property:', error);
      throw new Error('Failed to create property');
    }
  },
  
  // Update an existing property
  updateProperty: async (id: string, updates: Partial<Omit<Property, 'id' | 'createdAt' | 'views' | 'owner'>>): Promise<Property> => {
    try {
      return await trpcClient.property.updateProperty.mutate({
        id,
        ...updates,
      });
    } catch (error) {
      console.error('Error updating property:', error);
      throw new Error('Failed to update property');
    }
  },
  
  // Delete a property
  deleteProperty: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      return await trpcClient.property.deleteProperty.mutate({ id });
    } catch (error) {
      console.error('Error deleting property:', error);
      throw new Error('Failed to delete property');
    }
  },
};