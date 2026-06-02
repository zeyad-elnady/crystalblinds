-- ==========================================
-- STEP 1: Create the website_assets table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.website_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.website_assets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the images
CREATE POLICY "Allow public read access on website_assets" 
  ON public.website_assets FOR SELECT USING (true);

-- Allow authenticated users (admin) to insert/update/delete
CREATE POLICY "Allow authenticated full access on website_assets" 
  ON public.website_assets FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 2: Supabase Storage Setup 
-- (Best done via Supabase Dashboard UI, but here is the SQL equivalent if you have superuser rights)
-- ==========================================

-- Insert the storage bucket for website images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('website_images', 'website_images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'website_images');

-- Allow authenticated users to insert/update/delete objects in the bucket
CREATE POLICY "Admin Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'website_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'website_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'website_images' AND auth.role() = 'authenticated');

-- ==========================================
-- STEP 3: Initial Data Seed (Optional Defaults)
-- ==========================================

INSERT INTO public.website_assets (key, url, description) VALUES
('hero_bg', '/photos for crystal/1.jpeg', 'صورة خلفية الشاشة الرئيسية (Hero)'),
('why_us_1', '/photos for crystal/1.jpeg', 'صورة قسم لماذا نحن - أناقة وتصميم'),
('why_us_2', '/photos for crystal/2.jpeg', 'صورة قسم لماذا نحن - خبرة واحترافية'),
('why_us_3', '/photos for crystal/3.jpeg', 'صورة قسم لماذا نحن - جودة استثنائية'),
('why_us_4', '/photos for crystal/4.jpeg', 'صورة قسم لماذا نحن - حلول ذكية')
ON CONFLICT (key) DO NOTHING;
