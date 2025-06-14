import { z } from "zod";
import { router, publicProcedure, protectedProcedure, premiumProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const propertyRouter = router({
  // Get all properties with optional filters
  getProperties: publicProcedure
    .input(
      z.object({
        type: z.string().optional(),
        listingType: z.string().optional(),
        province: z.string().optional(),
        city: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        minBedrooms: z.number().optional(),
        minBathrooms: z.number().optional(),
        amenities: z.array(z.string()).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 20;
      const offset = input?.offset ?? 0;
      
      // Build the where clause based on filters
      const where: any = {};
      
      if (input?.type) {
        where.type = input.type;
      }
      
      if (input?.listingType) {
        where.listingType = input.listingType;
      }
      
      if (input?.province) {
        where.province = input.province;
      }
      
      if (input?.city) {
        where.city = input.city;
      }
      
      if (input?.minPrice) {
        where.price = {
          ...where.price,
          gte: input.minPrice,
        };
      }
      
      if (input?.maxPrice) {
        where.price = {
          ...where.price,
          lte: input.maxPrice,
        };
      }
      
      if (input?.minBedrooms) {
        where.bedrooms = {
          gte: input.minBedrooms,
        };
      }
      
      if (input?.minBathrooms) {
        where.bathrooms = {
          gte: input.minBathrooms,
        };
      }
      
      // For amenities, we need to use a more complex query
      let amenitiesFilter = undefined;
      if (input?.amenities && input.amenities.length > 0) {
        amenitiesFilter = {
          some: {
            name: {
              in: input.amenities,
            },
          },
        };
      }
      
      // Get properties
      const properties = await ctx.prisma.property.findMany({
        where: {
          ...where,
          amenities: amenitiesFilter,
        },
        include: {
          images: {
            orderBy: {
              order: 'asc',
            },
          },
          amenities: true,
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              role: true,
            },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      });
      
      // Format the properties
      return properties.map(property => ({
        id: property.id,
        title: property.title,
        description: property.description,
        price: property.price,
        type: property.type,
        listingType: property.listingType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        featured: property.featured,
        boostedUntil: property.boostedUntil,
        views: property.views,
        createdAt: property.createdAt,
        location: {
          province: property.province,
          city: property.city,
          district: property.district,
          address: property.address,
          latitude: property.latitude,
          longitude: property.longitude,
        },
        images: property.images.map(image => image.url),
        amenities: property.amenities.map(amenity => amenity.name),
        owner: {
          id: property.user.id,
          name: property.user.name,
          phone: property.user.phone,
          isPremium: property.user.role === 'premium',
        },
      }));
    }),
  
  // Get featured properties
  getFeaturedProperties: publicProcedure
    .query(async ({ ctx }) => {
      const properties = await ctx.prisma.property.findMany({
        where: {
          featured: true,
        },
        include: {
          images: {
            orderBy: {
              order: 'asc',
            },
          },
          amenities: true,
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });
      
      // Format the properties
      return properties.map(property => ({
        id: property.id,
        title: property.title,
        description: property.description,
        price: property.price,
        type: property.type,
        listingType: property.listingType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        featured: property.featured,
        boostedUntil: property.boostedUntil,
        views: property.views,
        createdAt: property.createdAt,
        location: {
          province: property.province,
          city: property.city,
          district: property.district,
          address: property.address,
          latitude: property.latitude,
          longitude: property.longitude,
        },
        images: property.images.map(image => image.url),
        amenities: property.amenities.map(amenity => amenity.name),
        owner: {
          id: property.user.id,
          name: property.user.name,
          phone: property.user.phone,
          isPremium: property.user.role === 'premium',
        },
      }));
    }),
  
  // Get user's properties
  getUserProperties: protectedProcedure
    .query(async ({ ctx }) => {
      const properties = await ctx.prisma.property.findMany({
        where: {
          userId: ctx.user.id,
        },
        include: {
          images: {
            orderBy: {
              order: 'asc',
            },
          },
          amenities: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // Format the properties
      return properties.map(property => ({
        id: property.id,
        title: property.title,
        description: property.description,
        price: property.price,
        type: property.type,
        listingType: property.listingType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        featured: property.featured,
        boostedUntil: property.boostedUntil,
        views: property.views,
        createdAt: property.createdAt,
        location: {
          province: property.province,
          city: property.city,
          district: property.district,
          address: property.address,
          latitude: property.latitude,
          longitude: property.longitude,
        },
        images: property.images.map(image => image.url),
        amenities: property.amenities.map(amenity => amenity.name),
      }));
    }),
  
  // Get a single property by ID
  getProperty: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const property = await ctx.prisma.property.findUnique({
        where: {
          id: input.id,
        },
        include: {
          images: {
            orderBy: {
              order: 'asc',
            },
          },
          amenities: true,
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              role: true,
            },
          },
        },
      });
      
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }
      
      // Increment views
      await ctx.prisma.property.update({
        where: {
          id: input.id,
        },
        data: {
          views: {
            increment: 1,
          },
        },
      });
      
      // Format the property
      return {
        id: property.id,
        title: property.title,
        description: property.description,
        price: property.price,
        type: property.type,
        listingType: property.listingType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        featured: property.featured,
        boostedUntil: property.boostedUntil,
        views: property.views + 1, // Include the increment
        createdAt: property.createdAt,
        location: {
          province: property.province,
          city: property.city,
          district: property.district,
          address: property.address,
          latitude: property.latitude,
          longitude: property.longitude,
        },
        images: property.images.map(image => image.url),
        amenities: property.amenities.map(amenity => amenity.name),
        owner: {
          id: property.user.id,
          name: property.user.name,
          phone: property.user.phone,
          isPremium: property.user.role === 'premium',
        },
      };
    }),
  
  // Create a new property
  createProperty: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5),
        description: z.string().min(10),
        price: z.number().positive(),
        type: z.string(),
        listingType: z.string(),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        area: z.number().optional(),
        province: z.string(),
        city: z.string(),
        district: z.string().optional(),
        address: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        images: z.array(z.string()),
        amenities: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is allowed to create more properties
      if (ctx.user.role !== "premium" && ctx.user.role !== "admin") {
        // Get settings
        const settings = await ctx.prisma.settings.findUnique({
          where: { id: "settings" },
        });
        
        const maxProperties = settings?.maxPropertiesForFreeUsers || 3;
        
        // Count user's properties
        const propertyCount = await ctx.prisma.property.count({
          where: {
            userId: ctx.user.id,
          },
        });
        
        if (propertyCount >= maxProperties) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Free users can only create ${maxProperties} properties. Upgrade to premium to create more.`,
          });
        }
      }
      
      // Create the property
      const property = await ctx.prisma.property.create({
        data: {
          title: input.title,
          description: input.description,
          price: input.price,
          type: input.type,
          listingType: input.listingType,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          area: input.area,
          province: input.province,
          city: input.city,
          district: input.district,
          address: input.address,
          latitude: input.latitude,
          longitude: input.longitude,
          userId: ctx.user.id,
        },
      });
      
      // Add images
      if (input.images.length > 0) {
        await ctx.prisma.propertyImage.createMany({
          data: input.images.map((url, index) => ({
            url,
            order: index,
            propertyId: property.id,
          })),
        });
      }
      
      // Add amenities
      if (input.amenities.length > 0) {
        await ctx.prisma.propertyAmenity.createMany({
          data: input.amenities.map(name => ({
            name,
            propertyId: property.id,
          })),
        });
      }
      
      // Get the created property with relations
      const createdProperty = await ctx.prisma.property.findUnique({
        where: {
          id: property.id,
        },
        include: {
          images: {
            orderBy: {
              order: 'asc',
            },
          },
          amenities: true,
        },
      });
      
      if (!createdProperty) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create property",
        });
      }
      
      // Format the property
      return {
        id: createdProperty.id,
        title: createdProperty.title,
        description: createdProperty.description,
        price: createdProperty.price,
        type: createdProperty.type,
        listingType: createdProperty.listingType,
        bedrooms: createdProperty.bedrooms,
        bathrooms: createdProperty.bathrooms,
        area: createdProperty.area,
        featured: createdProperty.featured,
        boostedUntil: createdProperty.boostedUntil,
        views: createdProperty.views,
        createdAt: createdProperty.createdAt,
        location: {
          province: createdProperty.province,
          city: createdProperty.city,
          district: createdProperty.district,
          address: createdProperty.address,
          latitude: createdProperty.latitude,
          longitude: createdProperty.longitude,
        },
        images: createdProperty.images.map(image => image.url),
        amenities: createdProperty.amenities.map(amenity => amenity.name),
      };
    }),
  
  // Update an existing property
  updateProperty: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          title: z.string().min(5).optional(),
          description: z.string().min(10).optional(),
          price: z.number().positive().optional(),
          type: z.string().optional(),
          listingType: z.string().optional(),
          bedrooms: z.number().optional(),
          bathrooms: z.number().optional(),
          area: z.number().optional(),
          province: z.string().optional(),
          city: z.string().optional(),
          district: z.string().optional(),
          address: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          images: z.array(z.string()).optional(),
          amenities: z.array(z.string()).optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if property exists and belongs to the user
      const property = await ctx.prisma.property.findUnique({
        where: {
          id: input.id,
        },
      });
      
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }
      
      if (property.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this property",
        });
      }
      
      // Update the property
      const updatedProperty = await ctx.prisma.property.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.data.title,
          description: input.data.description,
          price: input.data.price,
          type: input.data.type,
          listingType: input.data.listingType,
          bedrooms: input.data.bedrooms,
          bathrooms: input.data.bathrooms,
          area: input.data.area,
          province: input.data.province,
          city: input.data.city,
          district: input.data.district,
          address: input.data.address,
          latitude: input.data.latitude,
          longitude: input.data.longitude,
        },
        include: {
          images: true,
          amenities: true,
        },
      });
      
      // Update images if provided
      if (input.data.images) {
        // Delete existing images
        await ctx.prisma.propertyImage.deleteMany({
          where: {
            propertyId: input.id,
          },
        });
        
        // Add new images
        await ctx.prisma.propertyImage.createMany({
          data: input.data.images.map((url, index) => ({
            url,
            order: index,
            propertyId: input.id,
          })),
        });
      }
      
      // Update amenities if provided
      if (input.data.amenities) {
        // Delete existing amenities
        await ctx.prisma.propertyAmenity.deleteMany({
          where: {
            propertyId: input.id,
          },
        });
        
        // Add new amenities
        await ctx.prisma.propertyAmenity.createMany({
          data: input.data.amenities.map(name => ({
            name,
            propertyId: input.id,
          })),
        });
      }
      
      // Get the updated property with relations
      const finalProperty = await ctx.prisma.property.findUnique({
        where: {
          id: input.id,
        },
        include: {
          images: {
            orderBy: {
              order: 'asc',
            },
          },
          amenities: true,
        },
      });
      
      if (!finalProperty) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update property",
        });
      }
      
      // Format the property
      return {
        id: finalProperty.id,
        title: finalProperty.title,
        description: finalProperty.description,
        price: finalProperty.price,
        type: finalProperty.type,
        listingType: finalProperty.listingType,
        bedrooms: finalProperty.bedrooms,
        bathrooms: finalProperty.bathrooms,
        area: finalProperty.area,
        featured: finalProperty.featured,
        boostedUntil: finalProperty.boostedUntil,
        views: finalProperty.views,
        createdAt: finalProperty.createdAt,
        location: {
          province: finalProperty.province,
          city: finalProperty.city,
          district: finalProperty.district,
          address: finalProperty.address,
          latitude: finalProperty.latitude,
          longitude: finalProperty.longitude,
        },
        images: finalProperty.images.map(image => image.url),
        amenities: finalProperty.amenities.map(amenity => amenity.name),
      };
    }),
  
  // Delete a property
  deleteProperty: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if property exists and belongs to the user
      const property = await ctx.prisma.property.findUnique({
        where: {
          id: input.id,
        },
      });
      
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }
      
      if (property.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this property",
        });
      }
      
      // Delete the property (cascade will delete images and amenities)
      await ctx.prisma.property.delete({
        where: {
          id: input.id,
        },
      });
      
      return {
        success: true,
        message: "Property deleted successfully",
      };
    }),
  
  // Search properties
  searchProperties: publicProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 20;
      
      const properties = await ctx.prisma.property.findMany({
        where: {
          OR: [
            {
              title: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              city: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              district: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
          images: {
            orderBy: {
              order: 'asc',
            },
          },
          amenities: true,
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              role: true,
            },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
      });
      
      // Format the properties
      return properties.map(property => ({
        id: property.id,
        title: property.title,
        description: property.description,
        price: property.price,
        type: property.type,
        listingType: property.listingType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        featured: property.featured,
        boostedUntil: property.boostedUntil,
        views: property.views,
        createdAt: property.createdAt,
        location: {
          province: property.province,
          city: property.city,
          district: property.district,
          address: property.address,
          latitude: property.latitude,
          longitude: property.longitude,
        },
        images: property.images.map(image => image.url),
        amenities: property.amenities.map(amenity => amenity.name),
        owner: {
          id: property.user.id,
          name: property.user.name,
          phone: property.user.phone,
          isPremium: property.user.role === 'premium',
        },
      }));
    }),
  
  // Add property to favorites
  addToFavorites: protectedProcedure
    .input(
      z.object({
        propertyId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if property exists
      const property = await ctx.prisma.property.findUnique({
        where: {
          id: input.propertyId,
        },
      });
      
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }
      
      // Check if already in favorites
      const favorite = await ctx.prisma.favorite.findUnique({
        where: {
          userId_propertyId: {
            userId: ctx.user.id,
            propertyId: input.propertyId,
          },
        },
      });
      
      if (favorite) {
        return {
          success: true,
          message: "Property already in favorites",
        };
      }
      
      // Add to favorites
      await ctx.prisma.favorite.create({
        data: {
          userId: ctx.user.id,
          propertyId: input.propertyId,
        },
      });
      
      return {
        success: true,
        message: "Property added to favorites",
      };
    }),
  
  // Remove property from favorites
  removeFromFavorites: protectedProcedure
    .input(
      z.object({
        propertyId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Remove from favorites
      await ctx.prisma.favorite.delete({
        where: {
          userId_propertyId: {
            userId: ctx.user.id,
            propertyId: input.propertyId,
          },
        },
      });
      
      return {
        success: true,
        message: "Property removed from favorites",
      };
    }),
  
  // Get user's favorite properties
  getFavorites: protectedProcedure
    .query(async ({ ctx }) => {
      const favorites = await ctx.prisma.favorite.findMany({
        where: {
          userId: ctx.user.id,
        },
        include: {
          property: {
            include: {
              images: {
                orderBy: {
                  order: 'asc',
                },
              },
              amenities: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // Format the properties
      return favorites.map(favorite => ({
        id: favorite.property.id,
        title: favorite.property.title,
        description: favorite.property.description,
        price: favorite.property.price,
        type: favorite.property.type,
        listingType: favorite.property.listingType,
        bedrooms: favorite.property.bedrooms,
        bathrooms: favorite.property.bathrooms,
        area: favorite.property.area,
        featured: favorite.property.featured,
        boostedUntil: favorite.property.boostedUntil,
        views: favorite.property.views,
        createdAt: favorite.property.createdAt,
        location: {
          province: favorite.property.province,
          city: favorite.property.city,
          district: favorite.property.district,
          address: favorite.property.address,
          latitude: favorite.property.latitude,
          longitude: favorite.property.longitude,
        },
        images: favorite.property.images.map(image => image.url),
        amenities: favorite.property.amenities.map(amenity => amenity.name),
        owner: {
          id: favorite.property.user.id,
          name: favorite.property.user.name,
          phone: favorite.property.user.phone,
          isPremium: favorite.property.user.role === 'premium',
        },
      }));
    }),
  
  // Get property statistics
  getPropertyStats: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Check if property exists and belongs to the user
      const property = await ctx.prisma.property.findUnique({
        where: {
          id: input.id,
        },
      });
      
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }
      
      if (property.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this property's statistics",
        });
      }
      
      // Get favorites count
      const favoritesCount = await ctx.prisma.favorite.count({
        where: {
          propertyId: input.id,
        },
      });
      
      // Get conversations related to this property (in a real app, you would have a relation)
      // For now, we'll just return the views and favorites
      
      return {
        views: property.views,
        favorites: favoritesCount,
        contacts: 0, // Placeholder
        lastViewedAt: property.updatedAt,
      };
    }),
});