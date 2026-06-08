-- ==========================================
-- STEP 1: Create the contact_messages table
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

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public insert access so users can submit the contact form
CREATE POLICY "Allow public insert on contact_messages" 
  ON public.contact_messages FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admin) full access to read, update, or delete
CREATE POLICY "Allow authenticated full access on contact_messages" 
  ON public.contact_messages FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- STEP 2: Initial Data Seed (Optional Mock Data for Testing)
-- ==========================================

INSERT INTO public.contact_messages (name, phone, email, message, is_read) VALUES
('أحمد علي', '01122334455', 'ahmed@example.com', 'مرحباً، أود الاستفسار عن تفاصيل أسعار ستائر الزيبرا وموعد التركيب المتاح.', false),
('John Doe', '01012345678', 'john@example.com', 'I want to install blackout roller blinds in my office. Please contact me to schedule a visit.', false),
('منى محمد', '01234567890', null, 'هل توجد عروض أو خصومات للمساحات الكبيرة؟ أريد تركيب ستائر لمعرض كامل.', true)
ON CONFLICT DO NOTHING;
