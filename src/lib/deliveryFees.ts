import { supabase } from "./supabase";

export interface Governorate {
  id: string;
  nameEn: string;
  nameAr: string;
  fee: number;
}

export const GOVERNORATES: Governorate[] = [
  { id: 'cairo', nameEn: 'Cairo', nameAr: 'القاهرة', fee: 100 },
  { id: 'giza', nameEn: 'Giza', nameAr: 'الجيزة', fee: 100 },
  { id: 'alexandria', nameEn: 'Alexandria', nameAr: 'الإسكندرية', fee: 150 },
  { id: 'qalyubia', nameEn: 'Qalyubia', nameAr: 'القليوبية', fee: 150 },
  { id: 'sharqia', nameEn: 'Al Sharqia', nameAr: 'الشرقية', fee: 200 },
  { id: 'daqahlia', nameEn: 'Dakahlia', nameAr: 'الدقهلية', fee: 200 },
  { id: 'gharbia', nameEn: 'Gharbia', nameAr: 'الغربية', fee: 200 },
  { id: 'monufia', nameEn: 'Monufia', nameAr: 'المنوفية', fee: 200 },
  { id: 'beheira', nameEn: 'Beheira', nameAr: 'البحيرة', fee: 200 },
  { id: 'kafr_el_sheikh', nameEn: 'Kafr El Sheikh', nameAr: 'كفر الشيخ', fee: 200 },
  { id: 'port_said', nameEn: 'Port Said', nameAr: 'بورسعيد', fee: 250 },
  { id: 'ismailia', nameEn: 'Ismailia', nameAr: 'الإسماعيلية', fee: 250 },
  { id: 'suez', nameEn: 'Suez', nameAr: 'السويس', fee: 250 },
  { id: 'damietta', nameEn: 'Damietta', nameAr: 'دمياط', fee: 250 },
  { id: 'matrouh', nameEn: 'Matrouh', nameAr: 'مطروح', fee: 300 },
  { id: 'faiyum', nameEn: 'Faiyum', nameAr: 'الفيوم', fee: 200 },
  { id: 'beni_suef', nameEn: 'Beni Suef', nameAr: 'بنى سويف', fee: 200 },
  { id: 'minya', nameEn: 'Minya', nameAr: 'المنيا', fee: 250 },
  { id: 'asyut', nameEn: 'Asyut', nameAr: 'أسيوط', fee: 300 },
  { id: 'sohag', nameEn: 'Sohag', nameAr: 'سوهاج', fee: 300 },
  { id: 'qena', nameEn: 'Qena', nameAr: 'قنا', fee: 300 },
  { id: 'luxor', nameEn: 'Luxor', nameAr: 'الأقصر', fee: 350 },
  { id: 'aswan', nameEn: 'Aswan', nameAr: 'أسوان', fee: 350 },
  { id: 'red_sea', nameEn: 'Red Sea', nameAr: 'البحر الأحمر', fee: 400 },
  { id: 'new_valley', nameEn: 'New Valley', nameAr: 'الوادي الجديد', fee: 400 },
  { id: 'north_sinai', nameEn: 'North Sinai', nameAr: 'شمال سيناء', fee: 400 },
  { id: 'south_sinai', nameEn: 'South Sinai', nameAr: 'جنوب سيناء', fee: 400 }
];

export async function getDeliveryFees(): Promise<Governorate[]> {
  try {
    // Try fetching from direct API route first (fast & bypasses client RLS caching)
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/delivery-fees');
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const map = new Map(list.map((item: any) => [item.id, Number(item.fee)]));
          return GOVERNORATES.map(gov => ({
            ...gov,
            fee: map.has(gov.id) ? map.get(gov.id)! : gov.fee
          }));
        }
      }
    }

    const { data, error } = await supabase.from('delivery_fees').select('*');
    if (error || !data || data.length === 0) {
      return GOVERNORATES;
    }
    const dbMap = new Map(data.map((row: any) => [row.id, Number(row.fee)]));
    return GOVERNORATES.map(gov => ({
      ...gov,
      fee: dbMap.has(gov.id) ? dbMap.get(gov.id)! : gov.fee
    }));
  } catch (err) {
    console.warn("Unexpected error fetching delivery fees, using defaults:", err);
    return GOVERNORATES;
  }
}

export async function updateDeliveryFeeInDb(id: string, fee: number): Promise<boolean> {
  try {
    // Call API route
    const res = await fetch('/api/delivery-fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, fee })
    });
    if (res.ok) {
      const json = await res.json();
      return !!json.success;
    }

    // Direct Supabase fallback
    const { error } = await supabase
      .from('delivery_fees')
      .update({ fee })
      .eq('id', id);
    if (error) {
      console.error("Failed to update delivery fee in DB:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Unexpected error updating delivery fee:", err);
    return false;
  }
}

export async function resetAllDeliveryFeesInDb(): Promise<boolean> {
  try {
    const res = await fetch('/api/delivery-fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetDefaults: true })
    });
    if (res.ok) {
      const json = await res.json();
      return !!json.success;
    }
    return false;
  } catch (err) {
    console.error("Failed to reset delivery fees:", err);
    return false;
  }
}
