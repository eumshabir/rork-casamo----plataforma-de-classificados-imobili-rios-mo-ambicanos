-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  role TEXT DEFAULT 'user',
  verified BOOLEAN DEFAULT false,
  premium_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL NOT NULL,
  type TEXT NOT NULL,
  listing_type TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area DECIMAL,
  featured BOOLEAN DEFAULT false,
  boosted_until TIMESTAMP,
  views INTEGER DEFAULT 0,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create property_images table
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create property_amenities table
CREATE TABLE property_amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE
);

-- Create favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create conversation_participants table
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT NOT NULL,
  reference TEXT,
  transaction_id TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create devices table
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create settings table
CREATE TABLE settings (
  id TEXT PRIMARY KEY DEFAULT 'settings',
  premium_monthly_price DECIMAL DEFAULT 1500,
  premium_quarterly_price DECIMAL DEFAULT 4000,
  premium_yearly_price DECIMAL DEFAULT 15000,
  boost_7days_price DECIMAL DEFAULT 500,
  boost_15days_price DECIMAL DEFAULT 900,
  boost_30days_price DECIMAL DEFAULT 1600,
  currency TEXT DEFAULT 'MZN',
  max_images_per_property INTEGER DEFAULT 10,
  max_properties_for_free_users INTEGER DEFAULT 3
);

-- Insert default settings
INSERT INTO settings (id) VALUES ('settings');

-- Create storage buckets
INSERT INTO storage.buckets (id, name) VALUES ('property-images', 'Property Images');

-- Set up storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own objects" ON storage.objects FOR UPDATE USING (bucket_id = 'property-images' AND auth.uid() = owner);
CREATE POLICY "Users can delete own objects" ON storage.objects FOR DELETE USING (bucket_id = 'property-images' AND auth.uid() = owner);

-- Set up RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can read their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Property policies
CREATE POLICY "Anyone can read properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Users can create properties" ON properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own properties" ON properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own properties" ON properties FOR DELETE USING (auth.uid() = user_id);

-- Property images policies
CREATE POLICY "Anyone can read property images" ON property_images FOR SELECT USING (true);
CREATE POLICY "Users can create property images" ON property_images FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM properties WHERE id = property_id)
);
CREATE POLICY "Users can update their own property images" ON property_images FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM properties WHERE id = property_id)
);
CREATE POLICY "Users can delete their own property images" ON property_images FOR DELETE USING (
  auth.uid() IN (SELECT user_id FROM properties WHERE id = property_id)
);

-- Favorites policies
CREATE POLICY "Users can read their own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();