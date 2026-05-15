'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, Appointment, AppointmentStatus, AppointmentType } from '@/lib/supabase';
import styles from './admin.module.css';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};
const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: styles.statusPending,
  confirmed: styles.statusConfirmed,
  completed: styles.statusCompleted,
  cancelled: styles.statusCancelled,
};
const TYPE_LABELS: Record<AppointmentType, string> = {
  inspection: 'معاينة',
  installation: 'تركيب',
};
const TYPE_COLORS: Record<AppointmentType, string> = {
  inspection: styles.typeInspection,
  installation: styles.typeInstallation,
};
const CURTAIN_LABELS: Record<string, string> = {
  'Roller Blinds': 'ستائر رول',
  'Zebra Blinds': 'ستائر زيبرا',
  'Vertical Blinds': 'ستائر شرائح رأسية',
  'Metallic/Wooden Blinds': 'ستائر شرائح معدنية/خشبية',
  'Double System': 'ستائر دبل سيستم',
  'Printed': 'ستائر مطبوعة',
};

type FilterStatus = 'all' | AppointmentStatus;
type FilterType   = 'all' | AppointmentType;

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType]     = useState<FilterType>('all');
  const [filterDate, setFilterDate]     = useState('');
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState<Appointment | null>(null);
  const [showModal, setShowModal]       = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saving, setSaving]             = useState(false);

  // Settings state
  const [newEmail, setNewEmail]         = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [settingsMsg, setSettingsMsg]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // New appointment form
  const [newAppt, setNewAppt] = useState({
    client_name: '', client_phone: '', client_address: '',
    appointment_type: 'inspection' as AppointmentType,
    appointment_date: '', appointment_time: '', curtain_type: '', notes: '',
  });

  const fetchAppointments = useCallback(async () => {
    setLoading(true); setError(null);
    const { data, error } = await supabase
      .from('appointments').select('*').order('appointment_date', { ascending: true });
    if (error) setError('فشل تحميل البيانات. تحقق من إعدادات Supabase.');
    else setAppointments(data as Appointment[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const filtered = appointments.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterType   !== 'all' && a.appointment_type !== filterType) return false;
    if (filterDate   && a.appointment_date !== filterDate) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.client_name.toLowerCase().includes(q) || a.client_phone.includes(q) || a.client_address.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    inspection: appointments.filter(a => a.appointment_type === 'inspection').length,
    installation: appointments.filter(a => a.appointment_type === 'installation').length,
  };

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    setSaving(true);
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (!error) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    }
    setSaving(false);
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm('هل تريد حذف هذا الموعد؟')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) { setAppointments(prev => prev.filter(a => a.id !== id)); setShowModal(false); setSelected(null); }
  };

  const addAppointment = async () => {
    if (!newAppt.client_name || !newAppt.client_phone || !newAppt.appointment_date || !newAppt.appointment_time) {
      alert('يرجى ملء جميع الحقول المطلوبة'); return;
    }
    setSaving(true);
    const { data, error } = await supabase.from('appointments').insert([{ ...newAppt, status: 'pending' }]).select().single();
    if (!error && data) {
      setAppointments(prev => [...prev, data as Appointment]);
      setShowAddModal(false);
      setNewAppt({ client_name: '', client_phone: '', client_address: '', appointment_type: 'inspection', appointment_date: '', appointment_time: '', curtain_type: '', notes: '' });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  const handleUpdateCredentials = async () => {
    setSettingsSaving(true); setSettingsMsg(null);
    const updates: { email?: string; password?: string } = {};
    if (newEmail.trim())    updates.email    = newEmail.trim();
    if (newPassword.trim()) updates.password = newPassword.trim();
    if (!updates.email && !updates.password) {
      setSettingsMsg({ type: 'error', text: 'أدخل بريد إلكتروني أو كلمة مرور جديدة' });
      setSettingsSaving(false); return;
    }
    const { error } = await supabase.auth.updateUser(updates);
    if (error) setSettingsMsg({ type: 'error', text: error.message });
    else { setSettingsMsg({ type: 'success', text: 'تم التحديث بنجاح' }); setNewEmail(''); setNewPassword(''); }
    setSettingsSaving(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (t: string) => t?.slice(0, 5) ?? '';
  const today      = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter(a => a.appointment_date === today).length;

  return (
    <div className={`${styles.shell} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <button className={styles.mobileClose} onClick={() => setMobileMenuOpen(false)}>✕</button>
        <div className={styles.sidebarBrand}>
          <img src="/logo.png" alt="Crystal Blinds" className={styles.sidebarLogo} />
          <span className={styles.sidebarTitle}>لوحة التحكم</span>
        </div>
        <nav className={styles.sidebarNav}>
          <div className={styles.navItem + ' ' + styles.navItemActive}>
            <span>المواعيد</span>
          </div>
          <div className={styles.navItem} onClick={() => { setShowSettings(true); setMobileMenuOpen(false); }}>
            <span>الإعدادات</span>
          </div>
          <div className={styles.navItem} onClick={handleSignOut}>
            <span>تسجيل الخروج</span>
          </div>
        </nav>
        <div className={styles.sidebarFooter}>Crystal Blinds © 2024</div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Mobile Header Bar */}
        <div className={styles.mobileBar}>
          <img src="/logo2.png" alt="Crystal Blinds" className={styles.mobileBarLogo} />
          <button className={styles.menuBtn} onClick={() => setMobileMenuOpen(true)}>
            <div className={styles.menuBtnInner}>
              <span />
              <span />
              <span />
            </div>
          </button>
        </div>

        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>إدارة المواعيد</h1>
            <p className={styles.headerSub}>إجمالي {appointments.length} موعد · {todayCount} موعد اليوم</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.settingsBtn} onClick={() => setShowSettings(true)}>الإعدادات</button>
            <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>+ إضافة موعد</button>
          </div>
        </header>

        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { label: 'الكل',          value: counts.all,          color: '#d4af37' },
            { label: 'قيد الانتظار',  value: counts.pending,      color: '#b45309' },
            { label: 'مؤكدة',         value: counts.confirmed,    color: '#1d4ed8' },
            { label: 'مكتملة',        value: counts.completed,    color: '#065f46' },
            { label: 'ملغية',         value: counts.cancelled,    color: '#b91c1c' },
            { label: 'معاينات',       value: counts.inspection,   color: '#6d28d9' },
            { label: 'تركيب',         value: counts.installation, color: '#0369a1' },
          ].map(s => (
            <div key={s.label} className={styles.statCard} style={{ borderTopColor: s.color }}>
              <span className={styles.statValue} style={{ color: s.color }}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={styles.filtersRow}>
          <input className={styles.searchInput} placeholder="بحث بالاسم أو الهاتف أو العنوان..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className={styles.filterSelect} value={filterType} onChange={e => setFilterType(e.target.value as FilterType)}>
            <option value="all">كل الأنواع</option>
            <option value="inspection">معاينة</option>
            <option value="installation">تركيب</option>
          </select>
          <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)}>
            <option value="all">كل الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
          <div className={styles.dateFilterGroup}>
            <input 
              type="date" 
              className={styles.filterDateInput} 
              value={filterDate} 
              onChange={e => setFilterDate(e.target.value)} 
            />
            {filterDate && (
              <button className={styles.clearDateBtn} onClick={() => setFilterDate('')}>✕</button>
            )}
          </div>
          <button className={styles.refreshBtn} onClick={fetchAppointments}>تحديث</button>
        </div>

        {/* Table */}
        {loading ? (
          <div className={styles.loadingBox}><span className={styles.spinner} />جاري التحميل...</div>
        ) : error ? (
          <div className={styles.errorBox}>{error}</div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyBox}>لا توجد مواعيد تطابق الفلتر</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>العميل</th><th>الهاتف</th><th>العنوان</th>
                  <th>النوع</th><th>التاريخ</th><th>الوقت</th>
                  <th>الحالة</th><th>تعديل الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className={styles.tableRow} onClick={() => { setSelected(a); setShowModal(true); }}>
                    <td className={styles.clientName}>{a.client_name}</td>
                    <td dir="ltr">{a.client_phone}</td>
                    <td className={styles.addressCell}>{a.client_address}</td>
                    <td><span className={`${styles.badge} ${TYPE_COLORS[a.appointment_type]}`}>{TYPE_LABELS[a.appointment_type]}</span></td>
                    <td>{formatDate(a.appointment_date)}</td>
                    <td dir="ltr">{formatTime(a.appointment_time)}</td>
                    <td><span className={`${styles.badge} ${STATUS_COLORS[a.status]}`}>{STATUS_LABELS[a.status]}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <select className={styles.inlineSelect} value={a.status}
                        onChange={e => updateStatus(a.id, e.target.value as AppointmentStatus)} disabled={saving}>
                        <option value="pending">قيد الانتظار</option>
                        <option value="confirmed">مؤكد</option>
                        <option value="completed">مكتمل</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ── Detail Modal ── */}
      {showModal && selected && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>تفاصيل الموعد</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}><span className={styles.detailLabel}>الاسم</span><span>{selected.client_name}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>الهاتف</span><span dir="ltr">{selected.client_phone}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>العنوان</span><span>{selected.client_address}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>النوع</span><span className={`${styles.badge} ${TYPE_COLORS[selected.appointment_type]}`}>{TYPE_LABELS[selected.appointment_type]}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>التاريخ</span><span>{formatDate(selected.appointment_date)}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>الوقت</span><span dir="ltr">{formatTime(selected.appointment_time)}</span></div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>الحالة</span>
                  <select className={styles.modalSelect} value={selected.status}
                    onChange={e => updateStatus(selected.id, e.target.value as AppointmentStatus)} disabled={saving}>
                    <option value="pending">قيد الانتظار</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
                {selected.appointment_type === 'installation' && selected.curtain_type && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>نوع الستائر</span>
                    <span>{CURTAIN_LABELS[selected.curtain_type] || selected.curtain_type}</span>
                  </div>
                )}
                {selected.notes && (
                  <div className={`${styles.detailItem} ${styles.detailFull}`}>
                    <span className={styles.detailLabel}>ملاحظات</span><span>{selected.notes}</span>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.deleteBtn} onClick={() => deleteAppointment(selected.id)}>حذف الموعد</button>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Modal ── */}
      {showAddModal && (
        <div className={styles.overlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>إضافة موعد جديد</h2>
              <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>اسم العميل *</label>
                  <input className={styles.formInput} value={newAppt.client_name} onChange={e => setNewAppt(p => ({ ...p, client_name: e.target.value }))} placeholder="الاسم الكامل" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>رقم الهاتف *</label>
                  <input className={styles.formInput} dir="ltr" value={newAppt.client_phone} onChange={e => setNewAppt(p => ({ ...p, client_phone: e.target.value }))} placeholder="01xxxxxxxxx" />
                </div>
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>العنوان</label>
                  <input className={styles.formInput} value={newAppt.client_address} onChange={e => setNewAppt(p => ({ ...p, client_address: e.target.value }))} placeholder="العنوان التفصيلي" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>نوع الموعد *</label>
                  <select className={styles.formInput} value={newAppt.appointment_type} onChange={e => setNewAppt(p => ({ ...p, appointment_type: e.target.value as AppointmentType }))}>
                    <option value="inspection">معاينة</option>
                    <option value="installation">تركيب</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>التاريخ *</label>
                  <input className={styles.formInput} type="date" value={newAppt.appointment_date} onChange={e => setNewAppt(p => ({ ...p, appointment_date: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>الوقت *</label>
                  <input className={styles.formInput} type="time" value={newAppt.appointment_time} onChange={e => setNewAppt(p => ({ ...p, appointment_time: e.target.value }))} />
                </div>
                {newAppt.appointment_type === 'installation' && (
                  <div className={`${styles.formGroup} ${styles.formFull}`}>
                    <label className={styles.formLabel}>نوع الستائر *</label>
                    <select className={styles.formInput} value={newAppt.curtain_type} onChange={e => setNewAppt(p => ({ ...p, curtain_type: e.target.value }))}>
                      <option value="">اختر النوع</option>
                      {Object.entries(CURTAIN_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>ملاحظات</label>
                  <textarea className={`${styles.formInput} ${styles.formTextarea}`} value={newAppt.notes} onChange={e => setNewAppt(p => ({ ...p, notes: e.target.value }))} placeholder="أي ملاحظات إضافية..." />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveBtn} onClick={addAppointment} disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ الموعد'}</button>
              <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ── */}
      {showSettings && (
        <div className={styles.overlay} onClick={() => { setShowSettings(false); setSettingsMsg(null); }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>إعدادات الحساب</h2>
              <button className={styles.closeBtn} onClick={() => { setShowSettings(false); setSettingsMsg(null); }}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>البريد الإلكتروني الجديد</label>
                  <input className={styles.formInput} type="email" dir="ltr" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="admin@example.com" />
                </div>
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>كلمة المرور الجديدة</label>
                  <input className={styles.formInput} type="password" dir="ltr" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
                </div>
              </div>
              {settingsMsg && (
                <div style={{ marginTop: '1rem' }} className={settingsMsg.type === 'success' ? styles.successMsg : styles.loginError}>
                  {settingsMsg.text}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveBtn} onClick={handleUpdateCredentials} disabled={settingsSaving}>
                {settingsSaving ? 'جاري الحفظ...' : 'تحديث البيانات'}
              </button>
              <button className={styles.cancelBtn} onClick={() => { setShowSettings(false); setSettingsMsg(null); }}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
