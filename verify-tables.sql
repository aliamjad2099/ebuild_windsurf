-- Verify which tables exist and their structure
-- Run this to check what was actually created

-- Check if our new tables exist
SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_name IN ('ad_views', 'admin_actions', 'ad_contacts')
ORDER BY table_name;

-- Check columns in ads table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ads' 
ORDER BY column_name;

-- Check columns in users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY column_name;

-- If ad_views table exists, check its structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ad_views' 
ORDER BY column_name;
