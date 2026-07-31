-- ============================================
-- Fix infinite recursion in profiles RLS policy
-- Run this in Supabase SQL Editor
--
-- Problem: The "Admins can view all profiles" policy
-- queries the profiles table from within a policy on
-- the profiles table itself, causing infinite recursion.
--
-- This broke ALL authenticated queries touching profiles
-- (admin check, categories, products, payment methods, etc.)
-- with: "infinite recursion detected in policy for relation profiles"
-- ============================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Verify the remaining profiles policies (non-recursive)
-- Users can view own profile: auth.uid() = id
-- Users can update own profile: auth.uid() = id
-- Users can insert own profile: auth.uid() = id
