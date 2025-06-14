export interface PropertyLocation {
  province: string;
  city: string;
  neighborhood: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PropertyOwner {
  id: string;
  name: string;
  phone: string;
  isPremium: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: string; // apartment, house, land, commercial
  listingType: string; // sale, rent
  price: number;
  currency: string; // MZN, USD
  area: number; // in square meters
  location: PropertyLocation;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  featured?: boolean;
  views: number;
  createdAt: string;
  owner: PropertyOwner;
}

export interface PropertyFilter {
  type?: string;
  listingType?: string;
  province?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  amenities?: string[];
}