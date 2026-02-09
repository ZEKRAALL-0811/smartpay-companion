
-- Virtual bank accounts table
CREATE TABLE public.bank_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  mobile_number text NOT NULL,
  card_number_last4 text NOT NULL DEFAULT '0000',
  card_expiry text NOT NULL DEFAULT '12/28',
  account_balance numeric NOT NULL DEFAULT 50000,
  upi_pin_hash text,
  upi_id text,
  is_setup_complete boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bank account"
ON public.bank_accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank account"
ON public.bank_accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank account"
ON public.bank_accounts FOR UPDATE
USING (auth.uid() = user_id);

-- Money requests table
CREATE TABLE public.money_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid NOT NULL,
  requester_name text NOT NULL,
  requested_from text NOT NULL,
  amount numeric NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.money_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests"
ON public.money_requests FOR SELECT
USING (auth.uid() = requester_id);

CREATE POLICY "Users can create requests"
ON public.money_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update own requests"
ON public.money_requests FOR UPDATE
USING (auth.uid() = requester_id);

-- Add updated_at trigger for bank_accounts
CREATE TRIGGER update_bank_accounts_updated_at
BEFORE UPDATE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
