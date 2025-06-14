import { Property, PropertyFilter } from '@/types/property';
import { trpcClient } from '@/lib/trpc';

export const propertyService = {
  // Get all properties with optional filters
  getProperties: async (filter?: PropertyFilter): Promise<Property[]> => {
    try {
      const properties = await trpcClient.property.getProperties.query(filter || {});
      return properties;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw new Error('Falha ao buscar imóveis');
    }
  },
  
  // Get featured properties
  getFeaturedProperties: async (): Promise<Property[]> => {
    try {
      const featured = await trpcClient.property.getFeaturedProperties.query();
      return featured;
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      throw new Error('Falha ao buscar imóveis em destaque');
    }
  },
  
  // Get user's properties
  getUserProperties: async (): Promise<Property[]> => {
    try {
      const userProps = await trpcClient.property.getUserProperties.query();
      return userProps;
    } catch (error) {
      console.error('Error fetching user properties:', error);
      throw new Error('Falha ao buscar seus imóveis');
    }
  },
  
  // Create a new property
  createProperty: async (propertyData: {
    title: string;
    description: string;
    type: string;
    listingType: string;
    price: number;
    currency: string;
    area: number;
    location: {
      province: string;
      city: string;
      neighborhood: string;
      address?: string;
      coordinates?: { latitude: number; longitude: number };
    };
    images: string[];
    bedrooms?: number;
    bathrooms?: number;
    amenities: string[];
    featured?: boolean;
  }): Promise<Property> => {
    try {
      // For now, we'll just return a mock property
      // In a real app, this would call the backend
      return {
        id: `property_${Date.now()}`,
        ...propertyData,
        views: 0,
        createdAt: new Date().toISOString(),
        owner: {
          id: 'user_1',
          name: 'Current User',
          phone: '+1234567890',
          isPremium: false
        }
      };
    } catch (error) {
      console.error('Error creating property:', error);
      throw new Error('Falha ao criar imóvel');
    }
  },
};