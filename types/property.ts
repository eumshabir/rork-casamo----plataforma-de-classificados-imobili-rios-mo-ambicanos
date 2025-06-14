export type PropertyLocation = {
  province: string;
  city: string;
  neighborhood: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
};

export type PropertyOwner = {
  id: string;
  name: string;
  phone?: string;
  isPremium: boolean;
};

export type Property = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: string; // apartment, house, land, commercial
  listingType: string; // sale, rent
  bedrooms?: number;
  bathrooms?: number;
  area: number; // in square meters
  location: PropertyLocation;
  amenities: string[]; // pool, garage, garden, etc.
  images: string[]; // URLs to images
  views: number;
  featured?: boolean;
  createdAt: string;
  owner: PropertyOwner;
};