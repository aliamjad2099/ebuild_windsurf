-- Seller Dashboard Database Schema
-- This adds tables needed for seller dashboard functionality

-- Payment proofs table for membership upgrades
CREATE TABLE IF NOT EXISTS payment_proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_url TEXT, -- Will store Supabase Storage URL when implemented
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Featured ads table for premium ad features
CREATE TABLE IF NOT EXISTS featured_ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  featured_until TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_proof_id UUID REFERENCES payment_proofs(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seller analytics table for tracking performance
CREATE TABLE IF NOT EXISTS seller_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('view', 'contact', 'favorite', 'share')),
  metric_value INTEGER DEFAULT 1,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_proofs_user_id ON payment_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON payment_proofs(status);
CREATE INDEX IF NOT EXISTS idx_featured_ads_ad_id ON featured_ads(ad_id);
CREATE INDEX IF NOT EXISTS idx_featured_ads_user_id ON featured_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_featured_ads_status ON featured_ads(status);
CREATE INDEX IF NOT EXISTS idx_seller_analytics_user_id ON seller_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_analytics_ad_id ON seller_analytics(ad_id);
CREATE INDEX IF NOT EXISTS idx_seller_analytics_metric_type ON seller_analytics(metric_type);

-- Views for seller dashboard analytics
CREATE OR REPLACE VIEW seller_dashboard_stats AS
SELECT 
  u.id as seller_id,
  u.full_name,
  u.email,
  u.membership_type,
  COUNT(DISTINCT a.id) as total_ads,
  COUNT(DISTINCT CASE WHEN a.status = 'active' THEN a.id END) as active_ads,
  COALESCE(SUM(CASE WHEN sa.metric_type = 'view' THEN sa.metric_value END), 0) as total_views,
  COALESCE(SUM(CASE WHEN sa.metric_type = 'contact' THEN sa.metric_value END), 0) as total_contacts,
  COUNT(DISTINCT fa.id) as featured_ads_count
FROM users u
LEFT JOIN ads a ON u.id = a.seller_id
LEFT JOIN seller_analytics sa ON a.id = sa.ad_id
LEFT JOIN featured_ads fa ON a.id = fa.ad_id AND fa.status = 'active'
WHERE u.role = 'seller'
GROUP BY u.id, u.full_name, u.email, u.membership_type;

-- Function to automatically update seller analytics
CREATE OR REPLACE FUNCTION log_seller_analytics(
  p_user_id UUID,
  p_ad_id UUID,
  p_metric_type TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO seller_analytics (user_id, ad_id, metric_type, ip_address, user_agent)
  VALUES (p_user_id, p_ad_id, p_metric_type, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql;

-- Function to handle payment proof approval
CREATE OR REPLACE FUNCTION approve_payment_proof(
  p_proof_id UUID,
  p_admin_id UUID,
  p_admin_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Update payment proof status
  UPDATE payment_proofs 
  SET 
    status = 'approved',
    admin_notes = p_admin_notes,
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_proof_id
  RETURNING user_id INTO v_user_id;
  
  -- Upgrade user to premium membership
  UPDATE users 
  SET 
    membership_type = 'premium',
    updated_at = NOW()
  WHERE id = v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE payment_proofs IS 'Stores payment proof uploads for membership upgrades';
COMMENT ON TABLE featured_ads IS 'Tracks featured/premium ad placements';
COMMENT ON TABLE seller_analytics IS 'Stores seller performance metrics and analytics';
COMMENT ON VIEW seller_dashboard_stats IS 'Aggregated statistics for seller dashboard';
COMMENT ON FUNCTION log_seller_analytics IS 'Logs analytics events for seller performance tracking';
COMMENT ON FUNCTION approve_payment_proof IS 'Approves payment proof and upgrades user to premium membership';
