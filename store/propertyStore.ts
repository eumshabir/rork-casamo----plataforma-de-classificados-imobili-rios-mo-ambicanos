import { create } from 'zustand';
import { Property, PropertyFilter } from '@/types/property';
import { propertyService } from '@/services/propertyService';

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
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'views' | 'owner'>) => Promise<void>;
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
      const properties = await propertyService.getProperties(get().filter);
      set({ properties, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching properties:', error);
    }
  },
  
  fetchFeaturedProperties: async () => {
    set({ isLoading: true });
    try {
      const featured = await propertyService.getFeaturedProperties();
      set({ featuredProperties: featured, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching featured properties:', error);
    }
  },
  
  fetchUserProperties: async () => {
    set({ isLoading: true });
    try {
      const userProps = await propertyService.getUserProperties();
      set({ userProperties: userProps, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching user properties:', error);
    }
  },
  
  addProperty: async (property) => {
    set({ isLoading: true });
    try {
      const newProperty = await propertyService.createProperty(property);
      
      set(state => ({
        properties: [newProperty, ...state.properties],
        userProperties: [newProperty, ...state.userProperties],
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      console.error('Error adding property:', error);
      throw error;
    }
  },
  
  updateProperty: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updatedProperty = await propertyService.updateProperty(id, updates);
      
      set(state => ({
        properties: state.properties.map(p => 
          p.id === id ? updatedProperty : p
        ),
        userProperties: state.userProperties.map(p => 
          p.id === id ? updatedProperty : p
        ),
        featuredProperties: state.featuredProperties.map(p => 
          p.id === id ? updatedProperty : p
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      console.error('Error updating property:', error);
      throw error;
    }
  },
  
  deleteProperty: async (id) => {
    set({ isLoading: true });
    try {
      await propertyService.deleteProperty(id);
      
      set(state => ({
        properties: state.properties.filter(p => p.id !== id),
        userProperties: state.userProperties.filter(p => p.id !== id),
        featuredProperties: state.featuredProperties.filter(p => p.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      console.error('Error deleting property:', error);
      throw error;
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