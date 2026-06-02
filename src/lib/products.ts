import { supabase } from './supabase';

export interface ProductColor {
  id: string;
  nameEn: string;
  nameAr: string;
  hex: string;
  isSoldOut: boolean;
  image?: string;
}

export interface Product {
  id: string;
  images: string[];
  alt: string;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  detailsEn: string;
  detailsAr: string;
  category: string;
  price: number;
  is_active: boolean;
  colors: ProductColor[];
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      images: row.images || [],
      alt: row.alt || '',
      labelEn: row.label_en || '',
      labelAr: row.label_ar || '',
      descEn: row.desc_en || '',
      descAr: row.desc_ar || '',
      detailsEn: row.details_en || '',
      detailsAr: row.details_ar || '',
      category: row.category || '',
      price: row.price || 0,
      is_active: row.is_active !== false, // defaults to true
      colors: row.colors || [],
    }));
  } catch (err) {
    console.error('Unexpected error fetching products:', err);
    return [];
  }
}


