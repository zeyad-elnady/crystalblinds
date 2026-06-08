import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AppointmentType = 'inspection' | 'installation';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  created_at: string;
  client_name: string;
  client_phone: string;
  client_address: string;
  appointment_type: AppointmentType;
  appointment_date: string;
  appointment_time: string;
  curtain_type: string | null;
  notes: string | null;
  status: AppointmentStatus;
}

export type CalcType = 'square_meter' | 'linear_width' | 'linear_height' | 'unit';

export interface BillItem {
  name: string;
  height: number;
  width: number;
  quantity: number;
  price: number;
  calcType: CalcType;
  total: number;
}

export interface Bill {
  id: string;
  invoice_number: string;
  client_name: string;
  client_phone: string | null;
  client_address: string | null;
  order_number: string | null;
  payment_method: string;
  delivery_date: string | null;
  items: BillItem[];
  total_items_price: number;
  discount: number;
  installation_cost: number;
  transport_cost: number;
  deposit: number;
  remaining_amount: number;
  final_total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

