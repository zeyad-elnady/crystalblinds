-- ===================================================
-- STEP 1: Add new payment columns to orders table
-- ===================================================

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod',
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS transaction_image_url TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- ===================================================
-- STEP 2: Create storage bucket for transaction images
-- ===================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('transaction_images', 'transaction_images', true)
ON CONFLICT (id) DO NOTHING;

-- ===================================================
-- STEP 3: Setup Storage Security Policies
-- ===================================================

-- Allow public anonymous read access to the transaction screenshots
CREATE POLICY "Public Access Transaction Images" ON storage.objects FOR SELECT USING (bucket_id = 'transaction_images');

-- Allow public anonymous upload access to the transaction screenshots during checkout
CREATE POLICY "Public Upload Transaction Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'transaction_images');

-- Allow authenticated users (admin) to fully manage images
CREATE POLICY "Admin Upload Access Transaction Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'transaction_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update Access Transaction Images" ON storage.objects FOR UPDATE USING (bucket_id = 'transaction_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Access Transaction Images" ON storage.objects FOR DELETE USING (bucket_id = 'transaction_images' AND auth.role() = 'authenticated');
