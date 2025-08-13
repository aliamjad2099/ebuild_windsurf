-- BuildConnect Construction Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('seller', 'buyer', 'admin')),
    membership_type TEXT NOT NULL DEFAULT 'free' CHECK (membership_type IN ('free', 'premium')),
    phone TEXT,
    location TEXT,
    company_name TEXT,
    profile_image_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ads table
CREATE TABLE public.ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Materials', 'Equipment', 'Tools', 'Safety')),
    location TEXT NOT NULL,
    image_urls TEXT[], -- Array of image URLs
    is_premium BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'pending_approval')),
    views_count INTEGER DEFAULT 0,
    contact_phone TEXT,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table (for future expansion)
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.categories (name, description, icon) VALUES
('Materials', 'Construction materials like cement, steel, bricks', '🏗️'),
('Equipment', 'Heavy machinery and construction equipment', '🚛'),
('Tools', 'Hand tools and power tools', '🔧'),
('Safety', 'Safety equipment and protective gear', '🦺');

-- Create memberships table
CREATE TABLE public.memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('free', 'premium')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    payment_proof_url TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ad_views table (for analytics)
CREATE TABLE public.ad_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
    viewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for ads table
CREATE POLICY "Anyone can view active ads" ON public.ads
    FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can view their own ads" ON public.ads
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own ads" ON public.ads
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own ads" ON public.ads
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own ads" ON public.ads
    FOR DELETE USING (auth.uid() = seller_id);

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

-- RLS Policies for memberships
CREATE POLICY "Users can view their own memberships" ON public.memberships
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memberships" ON public.memberships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ad_views
CREATE POLICY "Anyone can insert ad views" ON public.ad_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own ad views" ON public.ad_views
    FOR SELECT USING (auth.uid() = viewer_id);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON public.ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment ad views
CREATE OR REPLACE FUNCTION increment_ad_views()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.ads 
    SET views_count = views_count + 1 
    WHERE id = NEW.ad_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to increment views when ad_views record is inserted
CREATE TRIGGER increment_ad_views_trigger
    AFTER INSERT ON public.ad_views
    FOR EACH ROW EXECUTE FUNCTION increment_ad_views();

-- Insert some sample data for testing (optional)
-- Note: This will only work after you have registered users through the app

-- Create indexes for better performance
CREATE INDEX idx_ads_seller_id ON public.ads(seller_id);
CREATE INDEX idx_ads_category ON public.ads(category);
CREATE INDEX idx_ads_location ON public.ads(location);
CREATE INDEX idx_ads_status ON public.ads(status);
CREATE INDEX idx_ads_created_at ON public.ads(created_at DESC);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);
