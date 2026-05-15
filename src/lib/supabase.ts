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
