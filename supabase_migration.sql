-- ═══════════════════════════════════════════════════
-- CRYSTAL BLINDS - UNIFIED DATABASE MIGRATION SCRIPT
-- ═══════════════════════════════════════════════════

-- ==========================================
-- STEP 1: Enable UUID & Extensions (if not already enabled)
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- STEP 2: Profiles Table (references auth.users)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'customer_service', 'sales', 'accountant', 'technician', 'employee')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow authenticated full access on profiles"
  ON public.profiles FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Automatic Profile Creation Trigger on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'employee')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    role = COALESCE(EXCLUDED.role, public.profiles.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill Profiles for Existing Users
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', 'Admin'), 
  COALESCE(raw_user_meta_data->>'role', 'admin')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STEP 3: Appointments Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ not null default now(),
  client_name text not null,
  client_phone text not null,
  client_address text not null default '',
  appointment_type text not null check (appointment_type in ('inspection', 'installation')),
  appointment_date date not null,
  appointment_time time not null,
  curtain_type text,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled'))
);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Appointments Policies
CREATE POLICY "allow_all" ON public.appointments
  FOR ALL USING (true) with check (true);

-- ==========================================
-- STEP 4: Products Table
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
  is_active BOOLEAN DEFAULT true,
  colors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Allow public read access on products" 
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access on products" 
  ON public.products FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 5: Orders Table (references products)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_address TEXT NOT NULL,
  width NUMERIC,
  height NUMERIC,
  color_id NUMERIC,
  type_id NUMERIC,
  pieces NUMERIC,
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'cod',
  whatsapp_number TEXT,
  transaction_image_url TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders Policies
CREATE POLICY "Allow public insert on orders" 
  ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated full access on orders" 
  ON public.orders FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 6: Clients Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  governorate TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('confirmed', 'lead', 'past', 'follow')),
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Clients Policies
CREATE POLICY "Allow authenticated full access on clients"
  ON public.clients FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 7: Maintenance Orders Table (references profiles)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.maintenance_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_type TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_address TEXT,
  technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  cost NUMERIC DEFAULT 0,
  parts_used TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on maintenance_orders
ALTER TABLE public.maintenance_orders ENABLE ROW LEVEL SECURITY;

-- Maintenance Orders Policies
CREATE POLICY "Allow authenticated full access on maintenance_orders"
  ON public.maintenance_orders FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 8: Expenses Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('salaries', 'marketing', 'rent', 'fuel', 'maintenance')),
  amount NUMERIC NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Expenses Policies
CREATE POLICY "Allow authenticated full access on expenses"
  ON public.expenses FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 9: Employees Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  salary NUMERIC DEFAULT 0,
  phone TEXT,
  work_start_time TEXT DEFAULT '09:00',
  work_end_time TEXT DEFAULT '17:00',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Employees Policies
CREATE POLICY "Allow authenticated full access on employees"
  ON public.employees FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 10: Attendance Table (references employees)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  delay_minutes INT DEFAULT 0,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Attendance Policies
CREATE POLICY "Allow authenticated full access on attendance"
  ON public.attendance FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 11: Delivery Fees (Governorates) Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.delivery_fees (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 0
);

-- Enable RLS on delivery_fees
ALTER TABLE public.delivery_fees ENABLE ROW LEVEL SECURITY;

-- Delivery Fees Policies
CREATE POLICY "Allow public read access on delivery_fees" 
  ON public.delivery_fees FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access on delivery_fees" 
  ON public.delivery_fees FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 12: Website Assets Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.website_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on website_assets
ALTER TABLE public.website_assets ENABLE ROW LEVEL SECURITY;

-- Website Assets Policies
CREATE POLICY "Allow public read access on website_assets" 
  ON public.website_assets FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access on website_assets" 
  ON public.website_assets FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 13: Contact Messages Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Contact Messages Policies
CREATE POLICY "Allow public insert on contact_messages" 
  ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated full access on contact_messages" 
  ON public.contact_messages FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 14: Partners Table
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

-- Enable RLS on partners
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Partners Policies
CREATE POLICY "Allow public read access on partners" 
  ON public.partners FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access on partners" 
  ON public.partners FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 15: Bills Table
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

-- Enable RLS on bills
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Bills Policies
CREATE POLICY "Allow authenticated full access on bills" 
  ON public.bills FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- ═══════════════════════════════════════════════════
-- STEP 16: Setup Storage Buckets and Security Policies
-- ═══════════════════════════════════════════════════

-- 1. Product Images Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product_images');
CREATE POLICY "Admin Upload Access Product Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update Access Product Images" ON storage.objects FOR UPDATE USING (bucket_id = 'product_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Access Product Images" ON storage.objects FOR DELETE USING (bucket_id = 'product_images' AND auth.role() = 'authenticated');

-- 2. Transaction Images Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('transaction_images', 'transaction_images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Transaction Images" ON storage.objects FOR SELECT USING (bucket_id = 'transaction_images');
CREATE POLICY "Public Upload Transaction Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'transaction_images');
CREATE POLICY "Admin Upload Access Transaction Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'transaction_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update Access Transaction Images" ON storage.objects FOR UPDATE USING (bucket_id = 'transaction_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Access Transaction Images" ON storage.objects FOR DELETE USING (bucket_id = 'transaction_images' AND auth.role() = 'authenticated');

-- 3. Website Images Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('website_images', 'website_images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Website Images" ON storage.objects FOR SELECT USING (bucket_id = 'website_images');
CREATE POLICY "Admin Upload Access Website Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'website_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update Access Website Images" ON storage.objects FOR UPDATE USING (bucket_id = 'website_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Access Website Images" ON storage.objects FOR DELETE USING (bucket_id = 'website_images' AND auth.role() = 'authenticated');

-- 4. Partner Images Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('partner_images', 'partner_images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Partner Images" ON storage.objects FOR SELECT USING (bucket_id = 'partner_images');
CREATE POLICY "Admin Upload Access Partner Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'partner_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update Access Partner Images" ON storage.objects FOR UPDATE USING (bucket_id = 'partner_images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Access Partner Images" ON storage.objects FOR DELETE USING (bucket_id = 'partner_images' AND auth.role() = 'authenticated');


-- ═══════════════════════════════════════════════════
-- STEP 17: Seed Initial Data
-- ═══════════════════════════════════════════════════

-- 1. Seed Products
INSERT INTO public.products (id, images, alt, label_en, label_ar, desc_en, desc_ar, details_en, details_ar, category, price, is_active, colors) VALUES
('b301c238-1234-4567-8901-abcdef123401', ARRAY['/photos for crystal/ستائر رول بلاك أوت.jpeg', '/photos for crystal/1.jpeg', '/photos for crystal/3.jpeg'], 'Blackout Roller Blinds', 'Blackout Roller Blinds', 'ستائر رول بلاك أوت', 'Absolute Light & Heat Insulation', 'عزل مطلق للضوء والحرارة', 'Crafted to completely block out sunlight and UV rays, ensuring maximum privacy and a restful environment anytime.', 'مصممة لحجب أشعة الشمس والأشعة فوق البنفسجية بالكامل، مما يضمن أقصى درجات الخصوصية وبيئة مريحة في أي وقت.', 'Roller', 1450, true, '[]'::jsonb),
('b301c238-1234-4567-8901-abcdef123402', ARRAY['/photos for crystal/ستائر رول صن سكرين.jpeg', '/photos for crystal/2.jpeg', '/photos for crystal/4.jpeg'], 'Sunscreen Roller Blinds', 'Sunscreen Roller Blinds', 'ستائر رول صن سكرين', 'Smart Protection & Natural Light', 'حماية ذكية وإضاءة طبيعية', 'Allows you to maintain your view while reducing glare and heat, perfect for living spaces that need natural lighting.', 'تسمح لك بالحفاظ على الرؤية مع تقليل الوهج والحرارة، مثالية لمساحات المعيشة التي تحتاج إلى إضاءة طبيعية.', 'Roller', 1300, true, '[]'::jsonb),
('b301c238-1234-4567-8901-abcdef123403', ARRAY['/photos for crystal/ستائر شرائح راسيه.jpeg', '/photos for crystal/3.jpeg', '/photos for crystal/1.jpeg'], 'Vertical Blinds', 'Vertical Blinds', 'ستائر شرائح رأسية', 'Flexible Control for Wide Spaces', 'تحكم مرن للمساحات الواسعة', 'Ideal for large windows and sliding doors, offering excellent light control and a sleek, contemporary appearance.', 'مثالية للنوافذ الكبيرة والأبواب المنزلقة، توفر تحكماً ممتازاً في الإضاءة ومظهراً عصرياً وأنيقاً.', 'Classic', 1100, true, '[]'::jsonb),
('b301c238-1234-4567-8901-abcdef123404', ARRAY['/photos for crystal/ستائر زيبرا.jpeg', '/photos for crystal/4.jpeg', '/photos for crystal/2.jpeg'], 'Zebra Blinds', 'Zebra Blinds', 'ستائر زيبرا', 'Modern Graduated Design', 'تصميم عصري متدرج', 'Features alternating sheer and solid fabric bands, giving you flexible control over light filtering and privacy in one brilliant design.', 'تتميز بأشرطة قماشية شفافة وصلبة متناوبة، مما يمنحك تحكماً مرناً في ترشيح الضوء والخصوصية في تصميم واحد رائع.', 'Modern', 1650, true, '[]'::jsonb),
('b301c238-1234-4567-8901-abcdef123405', ARRAY['/photos for crystal/ستائر شرائح معدنية.jpeg', '/photos for crystal/1.jpeg', '/photos for crystal/4.jpeg'], 'Metallic Blinds', 'Metallic/Wooden Blinds', 'ستائر شرائح معدنية/خشبية', 'Durability & Luxury for Every Taste', 'متانة وفخامة لكل ذوق', 'Engineered for longevity and style, these blinds offer a timeless look with effortless adjustability for any modern interior.', 'مصممة لتدوم وتتميز بالأناقة، تقدم هذه الستائر مظهراً خالداً مع إمكانية تعديل سهلة لأي تصميم داخلي حديث.', 'Classic', 1850, true, '[]'::jsonb),
('b301c238-1234-4567-8901-abcdef123406', ARRAY['/photos for crystal/ستائر دبل سيستم.jpeg', '/photos for crystal/3.jpeg', '/photos for crystal/2.jpeg'], 'Double System Blinds', 'Double System Blinds', 'ستائر دبل سيستم', 'Dual Intelligence & Unlimited Possibilities', 'ذكاء مزدوج وإمكانيات غير محدودة', 'A revolutionary design combining two distinct blinds in a single system, allowing seamless transition between sheer daytime elegance and nighttime privacy.', 'تصميم ثوري يجمع بين ستارتين مختلفتين في نظام واحد، مما يسمح بالانتقال السلس بين أناقة النهار الشفافة وخصوصية الليل.', 'Modern', 2100, true, '[]'::jsonb),
('b301c238-1234-4567-8901-abcdef123407', ARRAY['/photos for crystal/printed_roller.png', '/photos for crystal/2.jpeg', '/photos for crystal/4.jpeg'], 'Printed Roller Blinds', 'Printed Roller Blinds', 'ستائر رول مطبوعه', 'Custom Designs & Patterns', 'تصاميم ونقوش مخصصة', 'Add a personalized touch to your space with our premium printed roller blinds, featuring high-quality customized patterns and UV-resistant prints.', 'أضف لمسة شخصية لمساحتك مع ستائر الرول المطبوعة الفاخرة، تتميز بنقوش مخصصة عالية الجودة وطباعة مقاومة للأشعة فوق البنفسجية.', 'Printed', 1550, true, '[]'::jsonb),
('b301c238-1234-4567-8901-abcdef123408', ARRAY['/photos for crystal/hospital_curtain.png', '/photos for crystal/1.jpeg', '/photos for crystal/3.jpeg'], 'Bed Dividing Curtains', 'Bed Dividing Curtains', 'ستائر بين اسره', 'Professional Privacy Solutions', 'حلول احترافية للخصوصية', 'Professional-grade dividing curtains for hospitals and clinics. Designed for ultimate privacy, easy maintenance, and smooth track operation.', 'ستائر فواصل احترافية للمستشفيات والعيادات. مصممة لتوفير أقصى درجات الخصوصية، سهولة الصيانة، وحركة سلسة على المجرى.', 'Medical', 1200, true, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Delivery Fees
INSERT INTO public.delivery_fees (id, name_en, name_ar, fee) VALUES
('cairo', 'Cairo', 'القاهرة', 100),
('giza', 'Giza', 'الجيرة', 100),
('alexandria', 'Alexandria', 'الإسكندرية', 150),
('qalyubia', 'Qalyubia', 'القليوبية', 150),
('sharqia', 'Al Sharqia', 'الشرقية', 200),
('daqahlia', 'Dakahlia', 'الدقهلية', 200),
('gharbia', 'Gharbia', 'الغربية', 200),
('monufia', 'Monufia', 'المنوفية', 200),
('beheira', 'Beheira', 'البحيرة', 200),
('kafr_el_sheikh', 'Kafr El Sheikh', 'كفر الشيخ', 200),
('port_said', 'Port Said', 'بورسعيد', 250),
('ismailia', 'Ismailia', 'الإسماعيلية', 250),
('suez', 'Suez', 'السويس', 250),
('damietta', 'Damietta', 'دمياط', 250),
('matrouh', 'Matrouh', 'مطروح', 300),
('faiyum', 'Faiyum', 'الفيوم', 200),
('beni_suef', 'Beni Suef', 'بنى سويف', 200),
('minya', 'Minya', 'المنيا', 250),
('asyut', 'Asyut', 'أسيوط', 300),
('sohag', 'Sohag', 'سوهاج', 300),
('qena', 'Qena', 'قنا', 300),
('luxor', 'Luxor', 'الأقصر', 350),
('aswan', 'Aswan', 'أسوان', 350),
('red_sea', 'Red Sea', 'البحر الأحمر', 400),
('new_valley', 'New Valley', 'الوادي الجديد', 400),
('north_sinai', 'North Sinai', 'شمال سيناء', 400),
('south_sinai', 'South Sinai', 'جنوب سيناء', 400)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Website Assets
INSERT INTO public.website_assets (key, url, description) VALUES
('hero_bg', '/photos for crystal/1.jpeg', 'صورة خلفية الشاشة الرئيسية (Hero)'),
('why_us_1', '/photos for crystal/1.jpeg', 'صورة قسم لماذا نحن - أناقة وتصميم'),
('why_us_2', '/photos for crystal/2.jpeg', 'صورة قسم لماذا نحن - خبرة واحترافية'),
('why_us_3', '/photos for crystal/3.jpeg', 'صورة قسم لماذا نحن - جودة استثنائية'),
('why_us_4', '/photos for crystal/4.jpeg', 'صورة قسم لماذا نحن - حلول ذكية')
ON CONFLICT (key) DO NOTHING;

-- 4. Seed Partners
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

-- 5. Seed Contact Messages
INSERT INTO public.contact_messages (name, phone, email, message, is_read) VALUES
('أحمد علي', '01122334455', 'ahmed@example.com', 'مرحباً، أود الاستفسار عن تفاصيل أسعار ستائر الزيبرا وموعد التركيب المتاح.', false),
('John Doe', '01012345678', 'john@example.com', 'I want to install blackout roller blinds in my office. Please contact me to schedule a visit.', false),
('منى محمد', '01234567890', null, 'هل توجد عروض أو خصومات للمساحات الكبيرة؟ أريد تركيب ستائر لمعرض كامل.', true)
ON CONFLICT DO NOTHING;
