-- Admin Dashboard Database Schema (Step-by-Step Version)
-- Run each section separately to avoid dependency issues

-- SECTION 1: Add columns to existing tables
-- Run this first:

ALTER TABLE ads ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS contact_clicks INTEGER DEFAULT 0;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES users(id);

-- Update existing ads to be active
UPDATE ads SET status = 'active' WHERE status IS NULL;

SELECT 'Section 1 complete - columns added' as status;
