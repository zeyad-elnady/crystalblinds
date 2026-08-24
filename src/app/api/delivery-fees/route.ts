import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { GOVERNORATES } from '@/lib/deliveryFees';

export async function GET() {
  try {
    const { data, error } = await supabase.from('delivery_fees').select('*');
    if (error || !data || data.length === 0) {
      return NextResponse.json(GOVERNORATES);
    }
    
    // Check if DB table only contains flat 100 for all (initial dummy state)
    const allAreHundred = data.length > 5 && data.every((r: any) => Number(r.fee) === 100);
    if (allAreHundred) {
      return NextResponse.json(GOVERNORATES);
    }

    // Map db data
    const map = new Map(data.map((r: any) => [r.id, Number(r.fee)]));
    const merged = GOVERNORATES.map(gov => ({
      ...gov,
      fee: map.has(gov.id) ? map.get(gov.id)! : gov.fee
    }));

    return NextResponse.json(merged);
  } catch (err) {
    return NextResponse.json(GOVERNORATES);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const client = authHeader
      ? createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } })
      : supabase;

    const body = await req.json();
    const { id, fee } = body;

    if (id && fee !== undefined) {
      const { error } = await client
        .from('delivery_fees')
        .update({ fee: Number(fee) })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
