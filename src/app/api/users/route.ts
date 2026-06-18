import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Create a client linked to the requesting user's session
    const clientUser = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: { user }, error: authErr } = await clientUser.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }

    // Query profiles table to verify the user is an admin
    const { data: profile, error: profileErr } = await clientUser
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    // Read the request body fields
    const { email, password, name, role } = await req.json();
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const allowedRoles = ['admin', 'employee', 'customer_service', 'sales', 'accountant', 'technician'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Create a separate clean client instance to sign up the new user
    const clientAdmin = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: signUpData, error: signUpErr } = await clientAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (signUpErr) {
      return NextResponse.json({ error: signUpErr.message }, { status: 400 });
    }

    // In case the DB trigger didn't run or is not set up yet, we also attempt a direct insert
    // to keep it 100% resilient.
    if (signUpData.user) {
      await clientAdmin.from('profiles').upsert({
        id: signUpData.user.id,
        email,
        name,
        role,
      }, { onConflict: 'id' });
    }

    return NextResponse.json({ success: true, user: signUpData.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const clientUser = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: { user }, error: authErr } = await clientUser.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }

    // Query profiles table to verify the user is an admin
    const { data: profile, error: profileErr } = await clientUser
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    // Parse the id from the search params
    const { searchParams } = new URL(req.url);
    const userIdToDelete = searchParams.get('id');

    if (!userIdToDelete) {
      return NextResponse.json({ error: 'Missing user ID parameter' }, { status: 400 });
    }

    if (userIdToDelete === user.id) {
      return NextResponse.json({ error: 'You cannot delete your own profile' }, { status: 400 });
    }

    // Delete the profile row (deleting this revokes access to the admin panel)
    const { error: deleteErr } = await clientUser
      .from('profiles')
      .delete()
      .eq('id', userIdToDelete);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
