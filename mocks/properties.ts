import { Property, PropertyType, ListingType, Amenity } from '@/types/property';

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Apartamento Moderno T3 na Polana',
    description: 'Lindo apartamento com 3 quartos, 2 casas de banho, sala espaçosa e varanda com vista para o mar. Localizado no bairro da Polana, próximo a restaurantes e comércio.',
    price: 12000000,
    currency: 'MZN',
    type: 'apartment',
    listingType: 'sale',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    location: {
      province: 'maputo',
      city: 'maputo_city',
      neighborhood: 'Polana',
      coordinates: {
        latitude: -25.9692,
        longitude: 32.5732
      }
    },
    amenities: ['garage', 'security', 'aircon', 'balcony'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
    ],
    owner: {
      id: '101',
      name: 'João Silva',
      phone: '+258 84 123 4567',
      isPremium: true
    },
    featured: true,
    createdAt: '2023-06-10T14:30:00Z',
    views: 245
  },
  {
    id: '2',
    title: 'Moradia T4 com Piscina na Sommerschield',
    description: 'Luxuosa moradia com 4 quartos, 3 casas de banho, sala ampla, cozinha equipada, piscina e jardim. Localizada no bairro nobre de Sommerschield.',
    price: 25000000,
    currency: 'MZN',
    type: 'house',
    listingType: 'sale',
    bedrooms: 4,
    bathrooms: 3,
    area: 300,
    location: {
      province: 'maputo',
      city: 'maputo_city',
      neighborhood: 'Sommerschield',
      coordinates: {
        latitude: -25.9550,
        longitude: 32.5900
      }
    },
    amenities: ['pool', 'garage', 'garden', 'security', 'aircon'],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'
    ],
    owner: {
      id: '102',
      name: 'Maria Costa',
      phone: '+258 82 987 6543',
      isPremium: true
    },
    featured: true,
    createdAt: '2023-06-05T10:15:00Z',
    views: 320
  },
  {
    id: '3',
    title: 'Apartamento T2 para Arrendar na Malhangalene',
    description: 'Apartamento com 2 quartos, 1 casa de banho, sala e cozinha. Localizado no bairro da Malhangalene, próximo ao centro da cidade.',
    price: 35000,
    currency: 'MZN',
    type: 'apartment',
    listingType: 'rent',
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    location: {
      province: 'maputo',
      city: 'maputo_city',
      neighborhood: 'Malhangalene',
      coordinates: {
        latitude: -25.9650,
        longitude: 32.5800
      }
    },
    amenities: ['security', 'furnished'],
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
      'https://images.unsplash.com/photo-1502005097973-6a7082348e28',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0'
    ],
    owner: {
      id: '103',
      name: 'António Machava',
      phone: '+258 86 555 7890',
      isPremium: false
    },
    featured: false,
    createdAt: '2023-06-12T09:45:00Z',
    views: 178
  },
  {
    id: '4',
    title: 'Terreno para Construção na Matola',
    description: 'Terreno de 500m² para construção residencial. Localizado em zona tranquila da Matola, com bons acessos.',
    price: 3500000,
    currency: 'MZN',
    type: 'land',
    listingType: 'sale',
    area: 500,
    location: {
      province: 'maputo',
      city: 'matola',
      neighborhood: 'Matola A',
      coordinates: {
        latitude: -25.9620,
        longitude: 32.4580
      }
    },
    amenities: [],
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
      'https://images.unsplash.com/photo-1628624747186-a941c476b7ef'
    ],
    owner: {
      id: '104',
      name: 'Carlos Tembe',
      phone: '+258 84 333 2211',
      isPremium: false
    },
    featured: false,
    createdAt: '2023-06-08T16:20:00Z',
    views: 95
  },
  {
    id: '5',
    title: 'Escritório Moderno no Centro da Cidade',
    description: 'Escritório de 150m² no centro de Maputo. Espaço aberto, 2 salas de reuniões, copa e 2 casas de banho.',
    price: 75000,
    currency: 'MZN',
    type: 'office',
    listingType: 'rent',
    bathrooms: 2,
    area: 150,
    location: {
      province: 'maputo',
      city: 'maputo_city',
      neighborhood: 'Baixa',
      coordinates: {
        latitude: -25.9680,
        longitude: 32.5730
      }
    },
    amenities: ['aircon', 'elevator', 'security'],
    images: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2',
      'https://images.unsplash.com/photo-1497215842964-222b430dc094',
      'https://images.unsplash.com/photo-1604328698692-f76ea9498e76'
    ],
    owner: {
      id: '105',
      name: 'Empresa Imobiliária Lda',
      phone: '+258 21 123 456',
      isPremium: true
    },
    featured: true,
    createdAt: '2023-06-01T11:30:00Z',
    views: 210
  }
];