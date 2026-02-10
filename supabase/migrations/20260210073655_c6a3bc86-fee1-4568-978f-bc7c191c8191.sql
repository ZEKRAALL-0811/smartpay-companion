
-- Add app_pin_hash column to bank_accounts for the 4-6 digit app access PIN
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS app_pin_hash text;

-- Add email column to bank_accounts to store collected email during onboarding
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS email text;

-- Add otp_code and otp_expires_at for simulated OTP verification
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS otp_code text;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS otp_expires_at timestamp with time zone;
