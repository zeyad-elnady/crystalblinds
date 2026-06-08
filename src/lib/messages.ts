import { supabase } from './supabase';

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function submitContactMessage(payload: {
  name: string;
  phone: string;
  email: string | null;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('contact_messages').insert([payload]);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error submitting contact message:', err);
    return { success: false, error: err.message };
  }
}
