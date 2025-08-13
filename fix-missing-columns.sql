-- Fix missing columns in tracking tables
-- Run this to add the missing viewed_at column

-- Add missing viewed_at column to ad_views table
ALTER TABLE ad_views ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP DEFAULT NOW();

-- Add missing contacted_at column to ad_contacts table (if it exists)
ALTER TABLE ad_contacts ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMP DEFAULT NOW();

-- Verify the fix worked
SELECT 'Fixed missing columns' as status;

-- Check ad_views table structure now
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ad_views' 
ORDER BY column_name;
