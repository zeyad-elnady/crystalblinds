import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const ALLOWED_ROLES = ['admin', 'employee', 'customer_service', 'sales', 'accountant', 'technician'] as const;
type AllowedRole = typeof ALLOWED_ROLES[number];

function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string): { valid: boolean; reason?: string } {
  if (typeof password !== 'string') return { valid: false, reason: 'كلمة المرور غير صالحة' };
  if (password.length < 8) return { valid: false, reason: 'يجب ألا تقل كلمة المرور عن 8 أحرف' };
  if (!/\d/.test(password)) return { valid: false, reason: 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل' };
  return { valid: true };
}

function sanitizeName(name: string): string {
  if (typeof name !== 'string') return '';
  return name.trim().slice(0, 100);
}

async function verifyAdminAuth(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized: Missing token', status: 401 };
  }
  const token = authHeader.split(' ')[1];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const clientUser = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: authErr } = await clientUser.auth.getUser(token);
  if (authErr || !user) {
    return { error: 'Unauthorized: Invalid session', status: 401 };
  }

  const { data: profile, error: profileErr } = await clientUser
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile || profile.role !== 'admin') {
    return { error: 'Forbidden: Admin role required', status: 403 };
  }

  return { clientUser, user, profile, supabaseUrl, supabaseAnonKey };
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`users_post_${ip}`, { limit: 15, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const authResult = await verifyAdminAuth(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { clientUser, supabaseUrl, supabaseAnonKey } = authResult;

    const body = await req.json().catch(() => ({}));
    const { email, password, name, role } = body;

    // Strict Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة (الاسم، البريد، كلمة المرور، الصلاحية)' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: 'صيغة البريد الإلكتروني غير صحيحة' }, { status: 400 });
    }

    const pwdCheck = isValidPassword(String(password));
    if (!pwdCheck.valid) {
      return NextResponse.json({ error: pwdCheck.reason }, { status: 400 });
    }

    const cleanName = sanitizeName(name);
    if (cleanName.length < 2) {
      return NextResponse.json({ error: 'يجب أن يتكون الاسم من حرفين على الأقل' }, { status: 400 });
    }

    if (!ALLOWED_ROLES.includes(role as AllowedRole)) {
      return NextResponse.json({ error: 'نوع الصلاحية المحدد غير صالح' }, { status: 400 });
    }

    // Create a separate clean client instance to sign up the new user
    const clientAdmin = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: signUpData, error: signUpErr } = await clientAdmin.auth.signUp({
      email: cleanEmail,
      password: String(password),
      options: {
        data: {
          name: cleanName,
          role,
        },
      },
    });

    if (signUpErr) {
      return NextResponse.json({ error: signUpErr.message }, { status: 400 });
    }

    if (signUpData.user) {
      await clientUser.from('profiles').upsert({
        id: signUpData.user.id,
        email: cleanEmail,
        name: cleanName,
        role,
      }, { onConflict: 'id' });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: signUpData.user?.id,
        email: cleanEmail,
        name: cleanName,
        role
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`users_delete_${ip}`, { limit: 15, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const authResult = await verifyAdminAuth(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { clientUser, user } = authResult;

    const { searchParams } = new URL(req.url);
    const userIdToDelete = searchParams.get('id');

    if (!userIdToDelete || typeof userIdToDelete !== 'string') {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    if (userIdToDelete === user.id) {
      return NextResponse.json({ error: 'لا يمكنك حذف حسابك الشخصي النشط' }, { status: 400 });
    }

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

export async function PUT(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`users_put_${ip}`, { limit: 20, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const authResult = await verifyAdminAuth(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { clientUser, user, supabaseUrl } = authResult;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const body = await req.json().catch(() => ({}));
    const { userId, name, role, password } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    // Mass-assignment whitelist: Only allow explicit update fields
    const updatePayload: { updated_at: string; name?: string; role?: AllowedRole } = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) {
      const cleanName = sanitizeName(name);
      if (cleanName.length < 2) {
        return NextResponse.json({ error: 'يجب أن يتكون الاسم من حرفين على الأقل' }, { status: 400 });
      }
      updatePayload.name = cleanName;
    }

    if (role !== undefined) {
      if (!ALLOWED_ROLES.includes(role as AllowedRole)) {
        return NextResponse.json({ error: 'نوع الصلاحية المحدد غير صالح' }, { status: 400 });
      }
      updatePayload.role = role as AllowedRole;
    }

    const { error: updateProfileErr } = await clientUser
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId);

    if (updateProfileErr) {
      return NextResponse.json({ error: updateProfileErr.message }, { status: 400 });
    }

    // Password Update Logic
    if (password && String(password).trim()) {
      const pwdCheck = isValidPassword(String(password));
      if (!pwdCheck.valid) {
        return NextResponse.json({ error: pwdCheck.reason }, { status: 400 });
      }

      if (serviceRoleKey) {
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        });
        const { error: pwdErr } = await adminClient.auth.admin.updateUserById(userId, {
          password: String(password).trim()
        });
        if (pwdErr) {
          return NextResponse.json({ error: `تم تحديث البيانات، لكن حدث خطأ بتغيير كلمة المرور: ${pwdErr.message}` }, { status: 400 });
        }
      } else if (userId === user.id) {
        const { error: pwdErr } = await clientUser.auth.updateUser({ password: String(password).trim() });
        if (pwdErr) {
          return NextResponse.json({ error: `فشل تغيير كلمة المرور: ${pwdErr.message}` }, { status: 400 });
        }
      } else {
        return NextResponse.json({ 
          success: true, 
          warning: 'تم تحديث اسم ورتبة المستخدم بنجاح. لتغيير كلمة مرور مستخدم آخر يتطلب ضبط SUPABASE_SERVICE_ROLE_KEY في ملف البيئة.' 
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
