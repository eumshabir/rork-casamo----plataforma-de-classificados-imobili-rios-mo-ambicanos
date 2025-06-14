import { Property, PropertyFilter } from '@/types/property';
import { handleApiError, shouldUseTRPC } from './api';
import { mockProperties } from '@/mocks/properties';
import { trpcClient } from '@/lib/trpc';

export const propertyService = {
  // Get all properties with optional filters
  getProperties: async (filter?: PropertyFilter): Promise<Property[]> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.property.getProperties.query(filter);
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Apply filters if any
      let filteredProperties = [...mockProperties];
      
      if (filter?.type) {
        filteredProperties = filteredProperties.filter(p => p.type === filter.type);
      }
      
      if (filter?.listingType) {
        filteredProperties = filteredProperties.filter(p => p.listingType === filter.listingType);
      }
      
      if (filter?.province) {
        filteredProperties = filteredProperties.filter(p => p.location.province === filter.province);
      }
      
      if (filter?.city) {
        filteredProperties = filteredProperties.filter(p => p.location.city === filter.city);
      }
      
      if (filter?.minPrice) {
        filteredProperties = filteredProperties.filter(p => p.price >= (filter.minPrice || 0));
      }
      
      if (filter?.maxPrice) {
        filteredProperties = filteredProperties.filter(p => p.price <= (filter.maxPrice || Infinity));
      }
      
      if (filter?.minBedrooms) {
        filteredProperties = filteredProperties.filter(p => (p.bedrooms || 0) >= (filter.minBedrooms || 0));
      }
      
      if (filter?.minBathrooms) {
        filteredProperties = filteredProperties.filter(p => (p.bathrooms || 0) >= (filter.minBathrooms || 0));
      }
      
      if (filter?.amenities && filter.amenities.length > 0) {
        filteredProperties = filteredProperties.filter(p => 
          filter.amenities?.every(amenity => p.amenities.includes(amenity))
        );
      }
      
      return filteredProperties;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Get featured properties
  getFeaturedProperties: async (): Promise<Property[]> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.property.getFeaturedProperties.query();
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const featured = mockProperties.filter(p => p.featured);
      return featured;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Get user's properties
  getUserProperties: async (): Promise<Property[]> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.property.getUserProperties.query();
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo, we'll just use the first two properties
      const userProps = mockProperties.slice(0, 2);
      return userProps;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Get a single property by ID
  getProperty: async (id: string): Promise<Property> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.property.getProperty.query({ id });
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const property = mockProperties.find(p => p.id === id);
      if (!property) {
        throw new Error('Property not found');
      }
      
      return property;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Create a new property
  createProperty: async (propertyData: Omit<Property, 'id' | 'createdAt' | 'views'>): Promise<Property> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.property.createProperty.mutate(propertyData);
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newProperty: Property = {
        ...propertyData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        views: 0
      };
      
      // In a real app, we would save this to a database
      mockProperties.unshift(newProperty);
      
      return newProperty;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Update an existing property
  updateProperty: async (id: string, updates: Partial<Property>): Promise<Property> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.property.updateProperty.mutate({ id, data: updates });
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const propertyIndex = mockProperties.findIndex(p => p.id === id);
      if (propertyIndex === -1) {
        throw new Error('Property not found');
      }
      
      const updatedProperty = {
        ...mockProperties[propertyIndex],
        ...updates
      };
      
      mockProperties[propertyIndex] = updatedProperty;
      
      return updatedProperty;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Delete a property
  deleteProperty: async (id: string): Promise<boolean> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        const result = await trpcClient.property.deleteProperty.mutate({ id });
        return result.success;
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const propertyIndex = mockProperties.findIndex(p => p.id === id);
      if (propertyIndex === -1) {
        throw new Error('Property not found');
      }
      
      mockProperties.splice(propertyIndex, 1);
      
      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Upload property images
  uploadPropertyImages: async (propertyId: string, images: FormData): Promise<string[]> => {
    try {
      // In a real app, you would upload images to a storage service like AWS S3
      // For now, we'll just return mock image URLs
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock image URLs
      return Array(images.getAll('images').length)
        .fill(0)
        .map((_, i) => `https://images.unsplash.com/photo-${Date.now()}-${i}?w=800`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Get property statistics
  getPropertyStats: async (propertyId: string): Promise<any> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.property.getPropertyStats.query({ id: propertyId });
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Mock statistics
      return {
        views: Math.floor(Math.random() * 500) + 50,
        contacts: Math.floor(Math.random() * 20) + 1,
        favorites: Math.floor(Math.random() * 30) + 5,
        lastViewedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Search properties
  searchProperties: async (query: string): Promise<Property[]> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.property.searchProperties.query({ query });
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Simple search in title and description
      const results = mockProperties.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        p.description.toLowerCase().includes(query.toLowerCase())
      );
      
      return results;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Add property to favorites
  addToFavorites: async (propertyId: string): Promise<boolean> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        const result = await trpcClient.property.addToFavorites.mutate({ propertyId });
        return result.success;
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real app, we would save this to a database
      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Remove property from favorites
  removeFromFavorites: async (propertyId: string): Promise<boolean> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        const result = await trpcClient.property.removeFromFavorites.mutate({ propertyId });
        return result.success;
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real app, we would remove this from a database
      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Get user's favorite properties
  getFavorites: async (): Promise<Property[]> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.property.getFavorites.query();
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo, we'll just use a few random properties
      const favorites = mockProperties.slice(0, 3);
      return favorites;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // Boost a property
  boostProperty: async (propertyId: string, boostOptionId: string, paymentMethod: string, phoneNumber: string): Promise<any> => {
    try {
      // Try to use tRPC first
      if (await shouldUseTRPC()) {
        return await trpcClient.payment.boostProperty.mutate({
          propertyId,
          boostOptionId,
          paymentMethod,
          phoneNumber,
        });
      }
      
      // If tRPC is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock boost response
      return {
        success: true,
        message: "Imóvel destacado com sucesso",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};