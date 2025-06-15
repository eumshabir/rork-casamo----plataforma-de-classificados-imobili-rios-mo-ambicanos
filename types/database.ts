export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: 'user' | 'premium' | 'admin'
          verified: boolean
          premium_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          role?: 'user' | 'premium' | 'admin'
          verified?: boolean
          premium_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: 'user' | 'premium' | 'admin'
          verified?: boolean
          premium_until?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          price: number
          type: 'apartment' | 'house' | 'commercial' | 'land'
          listing_type: 'sale' | 'rent'
          bedrooms: number | null
          bathrooms: number | null
          area: number | null
          location_province: string
          location_city: string
          location_district: string | null
          location_address: string | null
          location_coordinates: Json | null
          images: string[]
          amenities: string[]
          featured: boolean
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          price: number
          type: 'apartment' | 'house' | 'commercial' | 'land'
          listing_type: 'sale' | 'rent'
          bedrooms?: number | null
          bathrooms?: number | null
          area?: number | null
          location_province: string
          location_city: string
          location_district?: string | null
          location_address?: string | null
          location_coordinates?: Json | null
          images?: string[]
          amenities?: string[]
          featured?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          price?: number
          type?: 'apartment' | 'house' | 'commercial' | 'land'
          listing_type?: 'sale' | 'rent'
          bedrooms?: number | null
          bathrooms?: number | null
          area?: number | null
          location_province?: string
          location_city?: string
          location_district?: string | null
          location_address?: string | null
          location_coordinates?: Json | null
          images?: string[]
          amenities?: string[]
          featured?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}