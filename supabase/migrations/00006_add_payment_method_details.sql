-- ============================================
-- Add payment details (jsonb) to payment_methods
-- Run AFTER 00005_add_terms_consent.sql
-- ============================================
-- Stores structured payment instructions per method, e.g.:
--   crypto:    { "wallet_addresses": { "BTC": "bc1...", "ETH": "0x...", "USDT": "T..." } }
--   bank:      { "bank": { "account_name": "...", "iban": "...", "swift": "...", "bank_name": "..." } }
--   moneygram: { "moneygram": { "receiver_name": "...", "receiver_details": "..." } }
ALTER TABLE payment_methods
  ADD COLUMN IF NOT EXISTS details jsonb DEFAULT '{}'::jsonb;
