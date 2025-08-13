-- Admin Dashboard Database Schema
-- Run this script in Supabase SQL Editor to set up admin functionality

-- Step 1: Add tracking fields to existing ads table
ALTER TABLE ads ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS contact_clicks INTEGER DEFAULT 0;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Step 2: Add user status fields for suspension management
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES users(id);

-- Step 3: Create ad views tracking table for analytics
CREATE TABLE IF NOT EXISTS ad_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  viewer_ip VARCHAR(45),
  viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_agent TEXT,
  viewed_at TIMESTAMP DEFAULT NOW()
);

-- Step 4: Create admin actions log for audit trail
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL, -- 'suspend_user', 'delete_ad', 'promote_user', etc.
  target_type VARCHAR(50) NOT NULL, -- 'user', 'ad', 'system'
  target_id UUID NOT NULL,
  details JSONB, -- Additional context about the action
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 5: Create contact clicks tracking for seller analytics
CREATE TABLE IF NOT EXISTS ad_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  contact_type VARCHAR(20) NOT NULL, -- 'phone', 'email', 'whatsapp'
  contacted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  contacted_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45)
);

-- Step 6: Create admin user in auth.users table
-- Note: This requires elevated permissions and may need to be run separately
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Generate a UUID for the admin user
    admin_user_id := gen_random_uuid();
    
    -- Insert into auth.users (this may require superuser permissions)
    -- If this fails, create the user manually through Supabase Auth UI
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        admin_user_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@example.com',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"role": "admin", "full_name": "Platform Administrator"}'
    )
    ON CONFLICT (email) DO NOTHING;
    
    -- Insert into public.users table
    INSERT INTO public.users (
        id,
        email,
        full_name,
        role,
        membership_type,
        status
    ) VALUES (
        admin_user_id,
        'admin@example.com',
        'Platform Administrator',
        'admin',
        'premium',
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        full_name = 'Platform Administrator',
        membership_type = 'premium';
        
    RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
END $$;

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ad_views_ad_id ON ad_views(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_viewed_at ON ad_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_ad_contacts_ad_id ON ad_contacts(ad_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 8: Create views for admin analytics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'seller' AND status = 'active') as total_sellers,
    (SELECT COUNT(*) FROM users WHERE role = 'buyer' AND status = 'active') as total_buyers,
    (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users,
    (SELECT COUNT(*) FROM ads WHERE status = 'active') as total_ads,
    (SELECT COUNT(*) FROM ad_views WHERE viewed_at >= CURRENT_DATE) as today_views,
    (SELECT COUNT(*) FROM ad_contacts WHERE contacted_at >= CURRENT_DATE) as today_contacts,
    (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE) as today_signups;

-- Step 9: Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id UUID,
    p_action_type VARCHAR(50),
    p_target_type VARCHAR(50),
    p_target_id UUID,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    action_id UUID;
BEGIN
    INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
    VALUES (p_admin_id, p_action_type, p_target_type, p_target_id, p_details)
    RETURNING id INTO action_id;
    
    RETURN action_id;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Alternative manual admin user creation (if Step 6 fails)
-- Run this if the automatic creation doesn't work due to auth.users permissions
/*
-- First, manually create user through Supabase Auth UI with:
-- Email: admin@example.com
-- Password: admin123
-- Then run this to add to users table:

INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    membership_type,
    status
) 
SELECT 
    id,
    'admin@example.com',
    'Platform Administrator',
    'admin',
    'premium',
    'active'
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Platform Administrator',
    membership_type = 'premium';
*/

-- Verification queries
SELECT 'Schema setup complete!' as status;
SELECT 'Admin user created:' as info, email, role FROM users WHERE role = 'admin';
SELECT 'Dashboard stats view:' as info, * FROM admin_dashboard_stats;
