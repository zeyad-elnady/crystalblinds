'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '../admin.module.css';

export default function LoginForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      setLoading(false);
    } else {
      window.location.replace('/admin');
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <img src="/logo2.png" alt="Crystal Blinds" className={styles.loginLogo} />
        <h1 className={styles.loginTitle}>لوحة التحكم</h1>
        <p className={styles.loginSubtitle}>تسجيل الدخول للمتابعة</p>
        <div className={styles.divider} />
        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>البريد الإلكتروني</label>
            <input
              className={styles.formInput}
              type="email"
              dir="ltr"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@crystalblinds.com"
              required
              autoComplete="email"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>كلمة المرور</label>
            <input
              className={styles.formInput}
              type="password"
              dir="ltr"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          {error && <div className={styles.loginError}>{error}</div>}
          <button className={styles.loginBtn} type="submit" disabled={loading}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
