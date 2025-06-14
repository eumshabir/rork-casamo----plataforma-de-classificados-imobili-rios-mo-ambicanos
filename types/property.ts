export type PropertyType = 'house' | 'apartment' | 'land' | 'office' | 'commercial' | 'warehouse' | 'farm';
export type ListingType = 'sale' | 'rent';
export type Amenity = 'pool' | 'garage' | 'garden' | 'security' | 'furnished' | 'aircon' | 'balcony' | 'elevator';

export interface Location {
  province: string;
  city: string;
  neighborhood?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Owner {
  id: string;
  name: string;
  phone: string;
  isPremium: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: PropertyType;
  listingType: ListingType;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  location: Location;
  amenities: Amenity[];
  images: string[];
  owner: Owner;
  featured: boolean;
  createdAt: string;
  views: number;
}

export interface PropertyFilter {
  type?: PropertyType;
  listingType?: ListingType;
  province?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  amenities?: Amenity[];
}