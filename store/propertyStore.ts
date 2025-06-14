import { create } from 'zustand';
import { Property, PropertyFilter, PropertyType, ListingType, Amenity } from '@/types/property';
import { mockProperties } from '@/mocks/properties';

interface PropertyState {
  properties: Property[];
  featuredProperties: Property[];
  userProperties: Property[];
  favoriteProperties: string[];
  isLoading: boolean;
  filter: PropertyFilter;
  
  fetchProperties: () => Promise<void>;
  fetchFeaturedProperties: () => Promise<void>;
  fetchUserProperties: () => Promise<void>;
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'views'>) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  setFilter: (filter: PropertyFilter) => void;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  featuredProperties: [],
  userProperties: [],
  favoriteProperties: [],
  isLoading: false,
  filter: {},
  
  fetchProperties: async () => {
    set({ isLoading: true });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Apply filters if any
      const filter = get().filter;
      let filteredProperties = [...mockProperties];
      
      if (filter.type) {
        filteredProperties = filteredProperties.filter(p => p.type === filter.type);
      }
      
      if (filter.listingType) {
        filteredProperties = filteredProperties.filter(p => p.listingType === filter.listingType);
      }
      
      if (filter.province) {
        filteredProperties = filteredProperties.filter(p => p.location.province === filter.province);
      }
      
      if (filter.city) {
        filteredProperties = filteredProperties.filter(p => p.location.city === filter.city);
      }
      
      if (filter.minPrice) {
        filteredProperties = filteredProperties.filter(p => p.price >= (filter.minPrice || 0));
      }
      
      if (filter.maxPrice) {
        filteredProperties = filteredProperties.filter(p => p.price <= (filter.maxPrice || Infinity));
      }
      
      if (filter.minBedrooms) {
        filteredProperties = filteredProperties.filter(p => (p.bedrooms || 0) >= (filter.minBedrooms || 0));
      }
      
      if (filter.minBathrooms) {
        filteredProperties = filteredProperties.filter(p => (p.bathrooms || 0) >= (filter.minBathrooms || 0));
      }
      
      if (filter.amenities && filter.amenities.length > 0) {
        filteredProperties = filteredProperties.filter(p => 
          filter.amenities?.every(amenity => p.amenities.includes(amenity))
        );
      }
      
      set({ properties: filteredProperties, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching properties:', error);
    }
  },
  
  fetchFeaturedProperties: async () => {
    set({ isLoading: true });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const featured = mockProperties.filter(p => p.featured);
      set({ featuredProperties: featured, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching featured properties:', error);
    }
  },
  
  fetchUserProperties: async () => {
    set({ isLoading: true });
    try {
      // In a real app, this would fetch the current user's properties
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo, we'll just use the first two properties
      const userProps = mockProperties.slice(0, 2);
      set({ userProperties: userProps, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching user properties:', error);
    }
  },
  
  addProperty: async (property) => {
    set({ isLoading: true });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newProperty: Property = {
        ...property,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        views: 0
      };
      
      set(state => ({
        properties: [newProperty, ...state.properties],
        userProperties: [newProperty, ...state.userProperties],
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      console.error('Error adding property:', error);
    }
  },
  
  updateProperty: async (id, updates) => {
    set({ isLoading: true });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set(state => ({
        properties: state.properties.map(p => 
          p.id === id ? { ...p, ...updates } : p
        ),
        userProperties: state.userProperties.map(p => 
          p.id === id ? { ...p, ...updates } : p
        ),
        featuredProperties: state.featuredProperties.map(p => 
          p.id === id ? { ...p, ...updates } : p
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      console.error('Error updating property:', error);
    }
  },
  
  deleteProperty: async (id) => {
    set({ isLoading: true });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      set(state => ({
        properties: state.properties.filter(p => p.id !== id),
        userProperties: state.userProperties.filter(p => p.id !== id),
        featuredProperties: state.featuredProperties.filter(p => p.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      console.error('Error deleting property:', error);
    }
  },
  
  toggleFavorite: (id) => {
    set(state => {
      const favorites = [...state.favoriteProperties];
      const index = favorites.indexOf(id);
      
      if (index === -1) {
        favorites.push(id);
      } else {
        favorites.splice(index, 1);
      }
      
      return { favoriteProperties: favorites };
    });
  },
  
  setFilter: (filter) => {
    set({ filter });
    get().fetchProperties();
  }
}));