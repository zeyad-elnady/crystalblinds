-- ===================================================
-- STEP 1: Create the delivery_fees table
-- ===================================================

CREATE TABLE IF NOT EXISTS public.delivery_fees (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.delivery_fees ENABLE ROW LEVEL SECURITY;

-- Allow public read access to delivery fees
CREATE POLICY "Allow public read access on delivery_fees" 
  ON public.delivery_fees FOR SELECT USING (true);

-- Allow authenticated users (admin) to fully manage delivery fees
CREATE POLICY "Allow authenticated full access on delivery_fees" 
  ON public.delivery_fees FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ===================================================
-- STEP 2: Seed the initial 27 Egyptian Governorates
-- ===================================================

INSERT INTO public.delivery_fees (id, name_en, name_ar, fee) VALUES
('cairo', 'Cairo', 'القاهرة', 100),
('giza', 'Giza', 'الجيزة', 100),
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
