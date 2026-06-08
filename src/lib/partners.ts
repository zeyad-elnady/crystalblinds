import { supabase } from './supabase';

export interface Partner {
  id: string;
  nameAr: string;
  nameEn: string;
  src: string;
  sort_order: number;
}

export async function getPartners(): Promise<Partner[]> {
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching partners:', error);
      return [];
    }
    
    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      nameAr: row.name_ar,
      nameEn: row.name_en,
      src: row.src,
      sort_order: row.sort_order || 0,
    }));
  } catch (err) {
    console.error('Unexpected error fetching partners:', err);
    return [];
  }
}
