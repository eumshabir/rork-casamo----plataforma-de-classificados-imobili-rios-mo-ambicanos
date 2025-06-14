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
  
  // Get a single property by ID
  getProperty: async (id: string): Promise<Property> => {
    try {
      const property = await trpcClient.property.getPropertyById.query({ id });
      return property;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw new Error('Imóvel não encontrado');
    }
  },
  
  // Create a new property
  createProperty: async (propertyData: Omit<Property, 'id' | 'createdAt' | 'views'>): Promise<Property> => {
    try {
      const newProperty = await trpcClient.property.createProperty.mutate(propertyData);
      return newProperty;
    } catch (error) {
      console.error('Error creating property:', error);
      throw new Error('Falha ao criar imóvel');
    }
  },
  
  // Update an existing property
  updateProperty: async (id: string, updates: Partial<Property>): Promise<Property> => {
    try {
      const updatedProperty = await trpcClient.property.updateProperty.mutate({
        id,
        ...updates
      });
      return updatedProperty;
    } catch (error) {
      console.error('Error updating property:', error);
      throw new Error('Falha ao atualizar imóvel');
    }
  },
  
  // Delete a property
  deleteProperty: async (id: string): Promise<boolean> => {
    try {
      const result = await trpcClient.property.deleteProperty.mutate({ id });
      return result.success;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw new Error('Falha ao excluir imóvel');
    }
  },
  
  // Upload property images
  uploadPropertyImages: async (propertyId: string, images: FormData): Promise<string[]> => {
    try {
      // For image uploads, we'll use a regular API endpoint instead of tRPC
      // since tRPC doesn't handle file uploads well
      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: 'POST',
        body: images,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload images');
      }
      
      const data = await response.json();
      return data.imageUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Falha ao enviar imagens');
    }
  },
  
  // Get property statistics
  getPropertyStats: async (propertyId: string): Promise<any> => {
    try {
      const stats = await trpcClient.property.getPropertyStats.query({ propertyId });
      return stats;
    } catch (error) {
      console.error('Error fetching property stats:', error);
      throw new Error('Falha ao buscar estatísticas');
    }
  },
  
  // Search properties
  searchProperties: async (query: string): Promise<Property[]> => {
    try {
      const results = await trpcClient.property.searchProperties.query({ query });
      return results;
    } catch (error) {
      console.error('Error searching properties:', error);
      throw new Error('Falha na busca');
    }
  }
};