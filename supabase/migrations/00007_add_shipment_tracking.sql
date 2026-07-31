-- ============================================
-- Amira Gold Investment Enterprise
-- Shipment Tracking
-- Run this in Supabase SQL Editor
-- ============================================

-- Add shipment tracking fields to orders.
-- shipment_events stores a JSONB array of timeline events:
--   [{"id","status","description","location","created_at","created_by"}, ...]
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS carrier TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipment_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipment_events JSONB DEFAULT '[]'::jsonb;
