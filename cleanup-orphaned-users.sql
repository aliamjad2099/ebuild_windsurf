-- Cleanup Orphaned Users Script
-- This script helps identify and clean up users stuck in Supabase Auth
-- who don't have corresponding entries in the custom users table

-- Step 1: Check users in auth.users (Supabase Auth table)
-- Note: You'll need to run this in Supabase SQL Editor with elevated permissions
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- Step 2: Check users in your custom users table
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- Step 3: Find orphaned users (in auth.users but not in public.users)
-- This query identifies users who registered but don't have profiles
SELECT 
    au.id,
    au.email,
    au.created_at as auth_created_at,
    au.raw_user_meta_data,
    CASE 
        WHEN pu.id IS NULL THEN 'ORPHANED - No profile in users table'
        ELSE 'OK - Has profile'
    END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC;

-- Step 4: Delete orphaned users from auth.users (CAREFUL - THIS IS DESTRUCTIVE)
-- Uncomment and run ONLY after confirming which users to delete
-- 
-- DELETE FROM auth.users 
-- WHERE id IN (
--     SELECT au.id 
--     FROM auth.users au
--     LEFT JOIN public.users pu ON au.id = pu.id
--     WHERE pu.id IS NULL
--     AND au.email != 'demo@example.com'  -- Keep demo user
--     AND au.created_at < NOW() - INTERVAL '1 hour'  -- Only delete users older than 1 hour
-- );

-- Step 5: Alternative - Create missing profiles for orphaned users
-- This creates profiles for users who exist in auth but not in users table
-- 
-- INSERT INTO public.users (id, email, full_name, role, membership_type)
-- SELECT 
--     au.id,
--     au.email,
--     COALESCE(au.raw_user_meta_data->>'full_name', 'Unknown User') as full_name,
--     COALESCE(au.raw_user_meta_data->>'role', 'buyer') as role,
--     'free' as membership_type
-- FROM auth.users au
-- LEFT JOIN public.users pu ON au.id = pu.id
-- WHERE pu.id IS NULL
-- AND au.email != 'demo@example.com'
-- ON CONFLICT (id) DO NOTHING;
