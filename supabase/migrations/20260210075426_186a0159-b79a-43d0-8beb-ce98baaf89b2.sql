
-- Add device fingerprint column to bank_accounts
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;
