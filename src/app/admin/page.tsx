'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed]     = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { setAuthed(true); }
      else { window.location.replace('/admin/login'); }
      setChecking(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) window.location.replace('/admin/login');
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f8', fontFamily: 'Tajawal, sans-serif', color: '#9ca3af' }}>
        جاري التحقق...
      </div>
    );
  }

  return authed ? <AdminDashboard /> : null;
}
