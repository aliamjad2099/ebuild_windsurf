-- SECTION 3: Create indexes and views
-- Run this after Section 2 completes successfully

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ad_views_ad_id ON ad_views(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_viewed_at ON ad_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_ad_contacts_ad_id ON ad_contacts(ad_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create admin dashboard stats view
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'seller' AND status = 'active') as total_sellers,
    (SELECT COUNT(*) FROM users WHERE role = 'buyer' AND status = 'active') as total_buyers,
    (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users,
    (SELECT COUNT(*) FROM ads WHERE status = 'active') as total_ads,
    (SELECT COUNT(*) FROM ad_views WHERE viewed_at >= CURRENT_DATE) as today_views,
    (SELECT COUNT(*) FROM ad_contacts WHERE contacted_at >= CURRENT_DATE) as today_contacts,
    (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE) as today_signups;

-- Create function to log admin actions
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

-- Test the dashboard stats view
SELECT 'Section 3 complete - indexes and views created' as status;
SELECT 'Dashboard stats:' as info, * FROM admin_dashboard_stats;
