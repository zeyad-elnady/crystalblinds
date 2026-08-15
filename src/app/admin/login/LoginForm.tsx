'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '../admin.module.css';

export default function LoginForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime]       = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutTime && Date.now() < lockoutTime) {
      const remainingSec = Math.ceil((lockoutTime - Date.now()) / 1000);
      setError(`تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار ${remainingSec} ثانية.`);
      return;
    }

    if (!email.trim() || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        const lockoutUntil = Date.now() + 30 * 1000;
        setLockoutTime(lockoutUntil);
        setError('تم حظر المحاولات مؤقتاً لمدة 30 ثانية بسبب تكرار إدخال بيانات خاطئة.');
      } else if (error.message.toLowerCase().includes('confirm') || error.message.toLowerCase().includes('not confirmed')) {
        setError('يرجى تأكيد البريد الإلكتروني أولاً لتسجيل الدخول');
      } else {
        setError(`البريد الإلكتروني أو كلمة المرور غير صحيحة (المحاولة ${newAttempts} من 5)`);
      }
      setLoading(false);
    } else {
      setFailedAttempts(0);
      setLockoutTime(null);
      window.location.replace('/admin');
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <img src="/logo2.png" alt="Crystal Blinds" className={styles.loginLogo} />
        <h1 className={styles.loginTitle}>لوحة التحكم</h1>
        <div className={styles.divider} />
        <form className={styles.loginForm} onSubmit={handleLogin} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>البريد الإلكتروني</label>
            <input
              className={styles.formInput}
              type="email"
              dir="ltr"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
