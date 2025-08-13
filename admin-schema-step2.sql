-- SECTION 2: Create new tables
-- Run this after Section 1 completes successfully

-- Create ad views tracking table
CREATE TABLE IF NOT EXISTS ad_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  viewer_ip VARCHAR(45),
  viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_agent TEXT,
  viewed_at TIMESTAMP DEFAULT NOW()
);

-- Create admin actions log
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create contact clicks tracking
CREATE TABLE IF NOT EXISTS ad_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  contact_type VARCHAR(20) NOT NULL,
  contacted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  contacted_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45)
);

SELECT 'Section 2 complete - new tables created' as status;
