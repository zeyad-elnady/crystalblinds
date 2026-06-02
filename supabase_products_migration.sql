-- ==========================================
-- STEP 1: Create the products table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alt TEXT NOT NULL,
  label_en TEXT NOT NULL,
  label_ar TEXT NOT NULL,
  desc_en TEXT NOT NULL,
  desc_ar TEXT NOT NULL,
  details_en TEXT NOT NULL,
  details_ar TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the products
CREATE POLICY "Allow public read access on products" 
  ON public.products FOR SELECT USING (true);

-- Allow authenticated users (admin) to insert/update/delete
CREATE POLICY "Allow authenticated full access on products" 
  ON public.products FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 2: Supabase Storage Setup for Products
-- ==========================================

-- Insert the storage bucket for product images (if not reusing website_images)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
CREATE POLICY "Public Access Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product_images');

-- Allow authenticated users to insert/update/delete objects in the bucket
CREATE POLICY "Admin Upload Access Product Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update Access Product Images" ON storage.objects FOR UPDATE USING (bucket_id = 'product_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Access Product Images" ON storage.objects FOR DELETE USING (bucket_id = 'product_images' AND auth.role() = 'authenticated');

-- ==========================================
-- STEP 3: Initial Data Seed (Migrate existing products)
-- ==========================================

INSERT INTO public.products (id, images, alt, label_en, label_ar, desc_en, desc_ar, details_en, details_ar, category, price) VALUES
('b301c238-1234-4567-8901-abcdef123401', ARRAY['/photos for crystal/ستائر رول بلاك أوت.jpeg', '/photos for crystal/1.jpeg', '/photos for crystal/3.jpeg'], 'Blackout Roller Blinds', 'Blackout Roller Blinds', 'ستائر رول بلاك أوت', 'Absolute Light & Heat Insulation', 'عزل مطلق للضوء والحرارة', 'Crafted to completely block out sunlight and UV rays, ensuring maximum privacy and a restful environment anytime.', 'مصممة لحجب أشعة الشمس والأشعة فوق البنفسجية بالكامل، مما يضمن أقصى درجات الخصوصية وبيئة مريحة في أي وقت.', 'Roller', 1450),
('b301c238-1234-4567-8901-abcdef123402', ARRAY['/photos for crystal/ستائر رول صن سكرين.jpeg', '/photos for crystal/2.jpeg', '/photos for crystal/4.jpeg'], 'Sunscreen Roller Blinds', 'Sunscreen Roller Blinds', 'ستائر رول صن سكرين', 'Smart Protection & Natural Light', 'حماية ذكية وإضاءة طبيعية', 'Allows you to maintain your view while reducing glare and heat, perfect for living spaces that need natural lighting.', 'تسمح لك بالحفاظ على الرؤية مع تقليل الوهج والحرارة، مثالية لمساحات المعيشة التي تحتاج إلى إضاءة طبيعية.', 'Roller', 1300),
('b301c238-1234-4567-8901-abcdef123403', ARRAY['/photos for crystal/ستائر شرائح راسيه.jpeg', '/photos for crystal/3.jpeg', '/photos for crystal/1.jpeg'], 'Vertical Blinds', 'Vertical Blinds', 'ستائر شرائح رأسية', 'Flexible Control for Wide Spaces', 'تحكم مرن للمساحات الواسعة', 'Ideal for large windows and sliding doors, offering excellent light control and a sleek, contemporary appearance.', 'مثالية للنوافذ الكبيرة والأبواب المنزلقة، توفر تحكماً ممتازاً في الإضاءة ومظهراً عصرياً وأنيقاً.', 'Classic', 1100),
('b301c238-1234-4567-8901-abcdef123404', ARRAY['/photos for crystal/ستائر زيبرا.jpeg', '/photos for crystal/4.jpeg', '/photos for crystal/2.jpeg'], 'Zebra Blinds', 'Zebra Blinds', 'ستائر زيبرا', 'Modern Graduated Design', 'تصميم عصري متدرج', 'Features alternating sheer and solid fabric bands, giving you flexible control over light filtering and privacy in one brilliant design.', 'تتميز بأشرطة قماشية شفافة وصلبة متناوبة، مما يمنحك تحكماً مرناً في ترشيح الضوء والخصوصية في تصميم واحد رائع.', 'Modern', 1650),
('b301c238-1234-4567-8901-abcdef123405', ARRAY['/photos for crystal/ستائر شرائح معدنية.jpeg', '/photos for crystal/1.jpeg', '/photos for crystal/4.jpeg'], 'Metallic Blinds', 'Metallic/Wooden Blinds', 'ستائر شرائح معدنية/خشبية', 'Durability & Luxury for Every Taste', 'متانة وفخامة لكل ذوق', 'Engineered for longevity and style, these blinds offer a timeless look with effortless adjustability for any modern interior.', 'مصممة لتدوم وتتميز بالأناقة، تقدم هذه الستائر مظهراً خالداً مع إمكانية تعديل سهلة لأي تصميم داخلي حديث.', 'Classic', 1850),
('b301c238-1234-4567-8901-abcdef123406', ARRAY['/photos for crystal/ستائر دبل سيستم.jpeg', '/photos for crystal/3.jpeg', '/photos for crystal/2.jpeg'], 'Double System Blinds', 'Double System Blinds', 'ستائر دبل سيستم', 'Dual Intelligence & Unlimited Possibilities', 'ذكاء مزدوج وإمكانيات غير محدودة', 'A revolutionary design combining two distinct blinds in a single system, allowing seamless transition between sheer daytime elegance and nighttime privacy.', 'تصميم ثوري يجمع بين ستارتين مختلفتين في نظام واحد، مما يسمح بالانتقال السلس بين أناقة النهار الشفافة وخصوصية الليل.', 'Modern', 2100),
('b301c238-1234-4567-8901-abcdef123407', ARRAY['/photos for crystal/printed_roller.png', '/photos for crystal/2.jpeg', '/photos for crystal/4.jpeg'], 'Printed Roller Blinds', 'Printed Roller Blinds', 'ستائر رول مطبوعه', 'Custom Designs & Patterns', 'تصاميم ونقوش مخصصة', 'Add a personalized touch to your space with our premium printed roller blinds, featuring high-quality customized patterns and UV-resistant prints.', 'أضف لمسة شخصية لمساحتك مع ستائر الرول المطبوعة الفاخرة، تتميز بنقوش مخصصة عالية الجودة وطباعة مقاومة للأشعة فوق البنفسجية.', 'Printed', 1550),
('b301c238-1234-4567-8901-abcdef123408', ARRAY['/photos for crystal/hospital_curtain.png', '/photos for crystal/1.jpeg', '/photos for crystal/3.jpeg'], 'Bed Dividing Curtains', 'Bed Dividing Curtains', 'ستائر بين اسره', 'Professional Privacy Solutions', 'حلول احترافية للخصوصية', 'Professional-grade dividing curtains for hospitals and clinics. Designed for ultimate privacy, easy maintenance, and smooth track operation.', 'ستائر فواصل احترافية للمستشفيات والعيادات. مصممة لتوفير أقصى درجات الخصوصية، سهولة الصيانة، وحركة سلسة على المجرى.', 'Medical', 1200)
ON CONFLICT (id) DO NOTHING;
