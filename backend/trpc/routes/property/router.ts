import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure, premiumProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

// Input validation schemas
const propertyFilterSchema = z.object({
  type: z.string().optional(),
  listingType: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minBedrooms: z.number().optional(),
  minBathrooms: z.number().optional(),
  amenities: z.array(z.string()).optional(),
});

const propertyCreateSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  price: z.number().positive(),
  type: z.string(),
  listingType: z.string(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  area: z.number().optional(),
  amenities: z.array(z.string()),
  images: z.array(z.string()),
  province: z.string(),
  city: z.string(),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const propertyUpdateSchema = propertyCreateSchema.partial();

export const propertyRouter = createTRPCRouter({
  // Get all properties with optional filters
  getProperties: publicProcedure
    .input(propertyFilterSchema.optional())
    .query(async ({ ctx, input }) => {
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
        where.price = { ...where.price, gte: input.minPrice };
      }
      
      if (input?.maxPrice) {
        where.price = { ...where.price, lte: input.maxPrice };
      }
      
      if (input?.minBedrooms) {
        where.bedrooms = { gte: input.minBedrooms };
      }
      
      if (input?.minBathrooms) {
        where.bathrooms = { gte: input.minBathrooms };
      }
      
      if (input?.amenities && input.amenities.length > 0) {
        where.amenities = { hasEvery: input.amenities };
      }
      
      const properties = await ctx.prisma.property.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      
      return properties;
    }),
  
  // Get featured properties
  getFeaturedProperties: publicProcedure.query(async ({ ctx }) => {
    const properties = await ctx.prisma.property.findMany({
      where: { featured: true },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    return properties;
  }),
  
  // Get user's properties
  getUserProperties: protectedProcedure.query(async ({ ctx }) => {
    const properties = await ctx.prisma.property.findMany({
      where: { ownerId: ctx.user.id },
      orderBy: { createdAt: "desc" },
    });
    
    return properties;
  }),
  
  // Get a single property by ID
  getProperty: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const property = await ctx.prisma.property.findUnique({
        where: { id: input.id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
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
      
      // Increment view count
      await ctx.prisma.property.update({
        where: { id: input.id },
        data: { views: { increment: 1 } },
      });
      
      return property;
    }),
  
  // Create a new property
  createProperty: protectedProcedure
    .input(propertyCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user is premium or has less than 3 properties (for free users)
      if (ctx.user.role !== "premium" && ctx.user.role !== "admin") {
        const propertyCount = await ctx.prisma.property.count({
          where: { ownerId: ctx.user.id },
        });
        
        if (propertyCount >= 3) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Free users can only create up to 3 properties. Upgrade to premium for unlimited listings.",
          });
        }
      }
      
      const property = await ctx.prisma.property.create({
        data: {
          ...input,
          ownerId: ctx.user.id,
        },
      });
      
      return property;
    }),
  
  // Update an existing property
  updateProperty: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: propertyUpdateSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if property exists and belongs to the user
      const property = await ctx.prisma.property.findUnique({
        where: { id: input.id },
      });
      
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }
      
      if (property.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this property",
        });
      }
      
      const updatedProperty = await ctx.prisma.property.update({
        where: { id: input.id },
        data: input.data,
      });
      
      return updatedProperty;
    }),
  
  // Delete a property
  deleteProperty: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if property exists and belongs to the user
      const property = await ctx.prisma.property.findUnique({
        where: { id: input.id },
      });
      
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }
      
      if (property.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this property",
        });
      }
      
      await ctx.prisma.property.delete({
        where: { id: input.id },
      });
      
      return { success: true };
    }),
  
  // Search properties
  searchProperties: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const properties = await ctx.prisma.property.findMany({
        where: {
          OR: [
            { title: { contains: input.query, mode: "insensitive" } },
            { description: { contains: input.query, mode: "insensitive" } },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      
      return properties;
    }),
  
  // Get property statistics
  getPropertyStats: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if property exists and belongs to the user
      const property = await ctx.prisma.property.findUnique({
        where: { id: input.id },
      });
      
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }
      
      if (property.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this property's statistics",
        });
      }
      
      // Get favorite count
      const favoriteCount = await ctx.prisma.favorite.count({
        where: { propertyId: input.id },
      });
      
      // In a real app, you would have more detailed statistics
      return {
        views: property.views,
        favorites: favoriteCount,
        lastViewedAt: new Date().toISOString(),
      };
    }),
  
  // Boost a property (make it featured)
  boostProperty: premiumProcedure
    .input(z.object({
      id: z.string(),
      duration: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if property exists and belongs to the user
      const property = await ctx.prisma.property.findUnique({
        where: { id: input.id },
      });
      
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }
      
      if (property.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to boost this property",
        });
      }
      
      // Calculate boost expiration date
      const boostedUntil = new Date();
      boostedUntil.setDate(boostedUntil.getDate() + input.duration);
      
      // Update property
      const updatedProperty = await ctx.prisma.property.update({
        where: { id: input.id },
        data: {
          featured: true,
          boostedUntil,
        },
      });
      
      return updatedProperty;
    }),
  
  // Add property to favorites
  addToFavorites: protectedProcedure
    .input(z.object({ propertyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if property exists
      const property = await ctx.prisma.property.findUnique({
        where: { id: input.propertyId },
      });
      
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }
      
      // Check if already in favorites
      const existingFavorite = await ctx.prisma.favorite.findFirst({
        where: {
          userId: ctx.user.id,
          propertyId: input.propertyId,
        },
      });
      
      if (existingFavorite) {
        return { success: true }; // Already in favorites
      }
      
      // Add to favorites
      await ctx.prisma.favorite.create({
        data: {
          userId: ctx.user.id,
          propertyId: input.propertyId,
        },
      });
      
      return { success: true };
    }),
  
  // Remove property from favorites
  removeFromFavorites: protectedProcedure
    .input(z.object({ propertyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.favorite.deleteMany({
        where: {
          userId: ctx.user.id,
          propertyId: input.propertyId,
        },
      });
      
      return { success: true };
    }),
  
  // Get user's favorite properties
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const favorites = await ctx.prisma.favorite.findMany({
      where: { userId: ctx.user.id },
      include: {
        property: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    return favorites.map(favorite => favorite.property);
  }),
});