-- ==========================================
-- STEP 1: Create the partners table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  src TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the partners
CREATE POLICY "Allow public read access on partners" 
  ON public.partners FOR SELECT USING (true);

-- Allow authenticated users (admin) to insert/update/delete
CREATE POLICY "Allow authenticated full access on partners" 
  ON public.partners FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 2: Supabase Storage Setup for Partners
-- ==========================================

-- Insert the storage bucket for partner images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('partner_images', 'partner_images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
CREATE POLICY "Public Access Partner Images" ON storage.objects FOR SELECT USING (bucket_id = 'partner_images');

-- Allow authenticated users to insert/update/delete objects in the bucket
CREATE POLICY "Admin Upload Access Partner Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'partner_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update Access Partner Images" ON storage.objects FOR UPDATE USING (bucket_id = 'partner_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Access Partner Images" ON storage.objects FOR DELETE USING (bucket_id = 'partner_images' AND auth.role() = 'authenticated');

-- ==========================================
-- STEP 3: Initial Data Seed (Migrate existing partners)
-- ==========================================

INSERT INTO public.partners (name_ar, name_en, src, sort_order) VALUES
('جوتكس', 'Gotex', '/out clients/Gotex_logo.png', 10),
('المطار', 'Almatar', '/out clients/almatar_logo_page.png', 20),
('ارابكوميد', 'Arabcomed', '/out clients/arabcomed logo.png', 30),
('بوخارست', 'Bucharest', '/out clients/bo5arest logo.png', 40),
('جانا فوم', 'Jana Foam', '/out clients/jana_foam_logo.png', 50),
('ماركون', 'Markoon', '/out clients/markoon logo.png', 60),
('مزايا', 'Mazaya', '/out clients/mazaya logo.png', 70),
('مؤسسة فاتبع سبباً - طيبة', 'Tayba Foundation', '/out clients/موسسه فاتبع سببا - طيبه logo.png', 80)
ON CONFLICT DO NOTHING;
