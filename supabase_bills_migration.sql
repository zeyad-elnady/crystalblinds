-- ==========================================
-- STEP 1: Create the bills table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_address TEXT,
  order_number TEXT,
  payment_method TEXT DEFAULT 'نقدي',
  delivery_date DATE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of { name, height, width, quantity, price, calcType, total }
  total_items_price NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  installation_cost NUMERIC NOT NULL DEFAULT 0,
  transport_cost NUMERIC NOT NULL DEFAULT 0,
  deposit NUMERIC NOT NULL DEFAULT 0,
  remaining_amount NUMERIC NOT NULL DEFAULT 0,
  final_total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admin) to read/write/delete bills
CREATE POLICY "Allow authenticated full access on bills" 
  ON public.bills FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- UPGRADE STATEMENTS
-- ==========================================
-- Execute these queries if your "bills" table already exists in Supabase:
--
-- ALTER TABLE public.bills DROP COLUMN IF EXISTS vat_percent;
-- ALTER TABLE public.bills DROP COLUMN IF EXISTS vat_amount;
-- ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS deposit NUMERIC NOT NULL DEFAULT 0;
-- ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC NOT NULL DEFAULT 0;
