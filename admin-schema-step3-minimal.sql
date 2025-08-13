-- SECTION 3: Minimal version - Create only what we can verify exists
-- Run this after verifying what tables actually exist

-- Create basic indexes on existing tables
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);

-- Create minimal admin dashboard stats view (without problematic tables)
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'seller' AND status = 'active') as total_sellers,
    (SELECT COUNT(*) FROM users WHERE role = 'buyer' AND status = 'active') as total_buyers,
    (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users,
    (SELECT COUNT(*) FROM ads WHERE status = 'active') as total_ads,
    0 as today_views, -- Will be 0 until we get tracking tables working
    0 as today_contacts, -- Will be 0 until we get tracking tables working
    (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE) as today_signups;

-- Test the minimal dashboard stats view
SELECT 'Minimal admin setup complete' as status;
SELECT 'Dashboard stats:' as info, * FROM admin_dashboard_stats;
