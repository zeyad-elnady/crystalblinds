-- ==========================================
-- STEP 1: Add columns to products table
-- ==========================================

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;

-- Example of JSONB structure for colors:
-- [
--   { "id": "0", "nameEn": "Ivory", "nameAr": "عاجي", "hex": "#e5d9c5", "isSoldOut": false, "image": "url" }
-- ]
