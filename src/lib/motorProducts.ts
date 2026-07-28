import { supabase } from './supabase';

export interface MotorProduct {
  id: string;
  brand: 'somfy' | 'azura';
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: number;
  image: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export async function getMotorProductsByBrand(brand: 'somfy' | 'azura'): Promise<MotorProduct[]> {
  try {
    const { data, error } = await supabase
      .from('motor_products')
      .select('*')
      .eq('brand', brand)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching motor products:', error);
      return [];
    }
    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      brand: row.brand,
      nameAr: row.name_ar || '',
      nameEn: row.name_en || '',
      descAr: row.desc_ar || '',
      descEn: row.desc_en || '',
      price: row.price || 0,
      image: row.image || '',
      category: row.category || '',
      is_active: row.is_active !== false,
      sort_order: row.sort_order || 0,
      created_at: row.created_at || '',
    }));
  } catch (err) {
    console.error('Unexpected error fetching motor products:', err);
    return [];
  }
}

export async function getAllMotorProducts(): Promise<MotorProduct[]> {
  try {
    const { data, error } = await supabase
      .from('motor_products')
      .select('*')
      .order('brand', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching all motor products:', error);
      return [];
    }
    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      brand: row.brand,
      nameAr: row.name_ar || '',
      nameEn: row.name_en || '',
      descAr: row.desc_ar || '',
      descEn: row.desc_en || '',
      price: row.price || 0,
      image: row.image || '',
      category: row.category || '',
      is_active: row.is_active !== false,
      sort_order: row.sort_order || 0,
      created_at: row.created_at || '',
    }));
  } catch (err) {
    console.error('Unexpected error fetching all motor products:', err);
    return [];
  }
}
