-- Add clickwrap consent columns to orders
-- Logs the buyer's acceptance of the Terms of Sale / Gold Purchase Agreement

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version TEXT;
