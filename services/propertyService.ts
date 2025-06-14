import { apiClient, handleApiError } from './api';
import { Property, PropertyFilter } from '@/types/property';
import { mockProperties } from '@/mocks/properties';

export const propertyService = {
  // Get all properties with optional filters
  getProperties: async (filter?: PropertyFilter): Promise<Property[]> => {
    try {
      // Try to use the real API first
      const response = await apiClient.get('/properties', { params: filter });
      return response.data;
    } catch (error) {
      // If API is not available, use mock
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
    }
  },
  
  // Get featured properties
  getFeaturedProperties: async (): Promise<Property[]> => {
    try {
      // Try to use the real API first
      const response = await apiClient.get('/properties/featured');
      return response.data;
    } catch (error) {
      // If API is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const featured = mockProperties.filter(p => p.featured);
      return featured;
    }
  },
  
  // Get user's properties
  getUserProperties: async (): Promise<Property[]> => {
    try {
      // Try to use the real API first
      const response = await apiClient.get('/properties/user');
      return response.data;
    } catch (error) {
      // If API is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo, we'll just use the first two properties
      const userProps = mockProperties.slice(0, 2);
      return userProps;
    }
  },
  
  // Get a single property by ID
  getProperty: async (id: string): Promise<Property> => {
    try {
      // Try to use the real API first
      const response = await apiClient.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      // If API is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const property = mockProperties.find(p => p.id === id);
      if (!property) {
        throw new Error('Property not found');
      }
      
      return property;
    }
  },
  
  // Create a new property
  createProperty: async (propertyData: Omit<Property, 'id' | 'createdAt' | 'views'>): Promise<Property> => {
    try {
      // Try to use the real API first
      const response = await apiClient.post('/properties', propertyData);
      return response.data;
    } catch (error) {
      // If API is not available, use mock
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
    }
  },
  
  // Update an existing property
  updateProperty: async (id: string, updates: Partial<Property>): Promise<Property> => {
    try {
      // Try to use the real API first
      const response = await apiClient.put(`/properties/${id}`, updates);
      return response.data;
    } catch (error) {
      // If API is not available, use mock
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
    }
  },
  
  // Delete a property
  deleteProperty: async (id: string): Promise<boolean> => {
    try {
      // Try to use the real API first
      await apiClient.delete(`/properties/${id}`);
      return true;
    } catch (error) {
      // If API is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const propertyIndex = mockProperties.findIndex(p => p.id === id);
      if (propertyIndex === -1) {
        throw new Error('Property not found');
      }
      
      mockProperties.splice(propertyIndex, 1);
      
      return true;
    }
  },
  
  // Upload property images
  uploadPropertyImages: async (propertyId: string, images: FormData): Promise<string[]> => {
    try {
      // Try to use the real API first
      const response = await apiClient.post(`/properties/${propertyId}/images`, images, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.imageUrls;
    } catch (error) {
      // If API is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock image URLs
      return Array(images.getAll('images').length)
        .fill(0)
        .map((_, i) => `https://images.unsplash.com/photo-${Date.now()}-${i}?w=800`);
    }
  },
  
  // Get property statistics
  getPropertyStats: async (propertyId: string): Promise<any> => {
    try {
      // Try to use the real API first
      const response = await apiClient.get(`/properties/${propertyId}/stats`);
      return response.data;
    } catch (error) {
      // If API is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Mock statistics
      return {
        views: Math.floor(Math.random() * 500) + 50,
        contacts: Math.floor(Math.random() * 20) + 1,
        favorites: Math.floor(Math.random() * 30) + 5,
        lastViewedAt: new Date().toISOString(),
      };
    }
  },
  
  // Search properties
  searchProperties: async (query: string): Promise<Property[]> => {
    try {
      // Try to use the real API first
      const response = await apiClient.get('/properties/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      // If API is not available, use mock
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Simple search in title and description
      const results = mockProperties.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        p.description.toLowerCase().includes(query.toLowerCase())
      );
      
      return results;
    }
  }
};