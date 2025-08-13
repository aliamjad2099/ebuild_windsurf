-- Fix RLS policies for authentication issues
-- Run this in your Supabase SQL Editor

-- Temporarily disable RLS on users table to debug
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Or alternatively, create more permissive policies
-- DROP existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;

-- Create more permissive policies
CREATE POLICY "Allow authenticated users to read their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow authenticated users to insert their own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow authenticated users to update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
