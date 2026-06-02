'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, Appointment, AppointmentStatus, AppointmentType } from '@/lib/supabase';
import { WebsiteAsset } from '@/lib/images';
import { Product } from '@/lib/products';
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

  // New states for active tab
  const [activeTab, setActiveTab]       = useState<'appointments' | 'website_edit' | 'products' | 'orders'>('appointments');
  const [websiteAssets, setWebsiteAssets] = useState<WebsiteAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  
  // Bulk update state
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkPrice, setBulkPrice] = useState<number | "">("");

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

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

  const fetchWebsiteAssets = useCallback(async () => {
    setLoadingAssets(true);
    const { data, error } = await supabase.from('website_assets').select('*').order('key');
    if (!error && data) setWebsiteAssets(data as WebsiteAsset[]);
    setLoadingAssets(false);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setProducts(data.map((row: any) => ({
        id: row.id, images: row.images || [], alt: row.alt, labelEn: row.label_en, labelAr: row.label_ar,
        descEn: row.desc_en, descAr: row.desc_ar, detailsEn: row.details_en, detailsAr: row.details_ar,
        category: row.category, price: row.price, is_active: row.is_active ?? true, colors: row.colors || []
      })));
    }
    setLoadingProducts(false);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase.from('orders').select('*, products(label_ar, label_en)').order('created_at', { ascending: false });
    if (!error && data) {
      setOrders(data);
    }
    setLoadingOrders(false);
  }, []);

  useEffect(() => { 
    if (activeTab === 'appointments') fetchAppointments(); 
    if (activeTab === 'website_edit') fetchWebsiteAssets();
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
  }, [fetchAppointments, fetchWebsiteAssets, fetchProducts, fetchOrders, activeTab]);

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

  const updateOrderStatus = async (id: string, status: string) => {
    setSaving(true);
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) setSelectedOrder((prev: any) => prev ? { ...prev, status } : null);
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

  const handleUploadImage = async (key: string, file: File) => {
    setUploadingAsset(key);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${key}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('website_images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from('website_images').getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;
      const { error: upsertError } = await supabase.from('website_assets').upsert({ key, url: publicUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (upsertError) throw upsertError;
      fetchWebsiteAssets();
      alert('تم رفع الصورة بنجاح');
    } catch (err) {
      alert('فشل رفع الصورة: ' + (err as any).message);
    } finally {
      setUploadingAsset(null);
    }
  };

  const handleSaveProduct = async () => {
    if (!selectedProduct?.labelEn || !selectedProduct?.labelAr) {
      alert('يرجى إدخال اسم المنتج'); return;
    }
    setSaving(true);
    const payload = {
      alt: selectedProduct.alt || selectedProduct.labelEn,
      label_en: selectedProduct.labelEn, label_ar: selectedProduct.labelAr,
      desc_en: selectedProduct.descEn || '', desc_ar: selectedProduct.descAr || '',
      details_en: selectedProduct.detailsEn || '', details_ar: selectedProduct.detailsAr || '',
      category: selectedProduct.category || 'Modern', price: selectedProduct.price || 0,
      images: selectedProduct.images || [], updated_at: new Date().toISOString(),
      is_active: selectedProduct.is_active !== false,
      colors: selectedProduct.colors || []
    };
    
    if (selectedProduct.id) {
      await supabase.from('products').update(payload).eq('id', selectedProduct.id);
    } else {
      await supabase.from('products').insert([payload]);
    }
    setSaving(false);
    setShowProductModal(false);
    fetchProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل تريد حذف هذا المنتج؟')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  const handleUploadProductImage = async (file: File) => {
    setUploadingProductImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('product_images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from('product_images').getPublicUrl(fileName);
      setSelectedProduct(prev => prev ? { ...prev, images: [...(prev.images || []), publicUrlData.publicUrl] } : null);
    } catch (err) {
      alert('فشل رفع الصورة: ' + (err as any).message);
    } finally {
      setUploadingProductImage(false);
    }
  };

  const handleBulkUpdatePrice = async () => {
    if (!bulkCategory || bulkPrice === "") return;
    if (!confirm(`هل أنت متأكد من تغيير سعر المتر لجميع منتجات قسم ${bulkCategory} إلى ${bulkPrice} ج.م؟`)) return;
    
    setSaving(true);
    const { error } = await supabase.from('products').update({ price: Number(bulkPrice) }).eq('category', bulkCategory);
    setSaving(false);
    
    if (error) {
      alert('حدث خطأ أثناء التحديث');
    } else {
      alert('تم التحديث بنجاح');
      setBulkCategory("");
      setBulkPrice("");
      fetchProducts();
    }
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
          <div className={`${styles.navItem} ${activeTab === 'appointments' ? styles.navItemActive : ''}`} onClick={() => { setActiveTab('appointments'); setMobileMenuOpen(false); }}>
            <span>المواعيد</span>
          </div>
          <div className={`${styles.navItem} ${activeTab === 'orders' ? styles.navItemActive : ''}`} onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}>
            <span>الطلبات</span>
          </div>
          <div className={`${styles.navItem} ${activeTab === 'products' ? styles.navItemActive : ''}`} onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}>
            <span>المنتجات</span>
          </div>
          <div className={`${styles.navItem} ${activeTab === 'website_edit' ? styles.navItemActive : ''}`} onClick={() => { setActiveTab('website_edit'); setMobileMenuOpen(false); }}>
            <span>تعديل الموقع</span>
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

        {activeTab === 'appointments' ? (
          <>
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
          </>
        ) : activeTab === 'website_edit' ? (
          <div className={styles.websiteEditContainer}>
            <header className={styles.header}>
              <div>
                <h1 className={styles.headerTitle}>تعديل الموقع</h1>
                <p className={styles.headerSub}>إدارة صور وخلفيات الموقع</p>
              </div>
            </header>
            
            {loadingAssets ? (
              <div className={styles.loadingBox}><span className={styles.spinner} />جاري تحميل الصور...</div>
            ) : (
              <div className={styles.assetsGrid}>
                {websiteAssets.map(asset => (
                  <div key={asset.key} className={styles.assetCard}>
                    <div className={styles.assetImageWrapper}>
                      <img src={asset.url} alt={asset.description || asset.key} className={styles.assetImage} />
                    </div>
                    <div className={styles.assetInfo}>
                      <h3 className={styles.assetTitle}>{asset.description || asset.key}</h3>
                      <p className={styles.assetKey}>{asset.key}</p>
                      
                      <div className={styles.assetActions}>
                        <label className={`${styles.uploadBtn} ${uploadingAsset === asset.key ? styles.uploadingBtn : ''}`}>
                          {uploadingAsset === asset.key ? 'جاري الرفع...' : 'تغيير الصورة'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className={styles.hiddenInput}
                            disabled={uploadingAsset === asset.key}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleUploadImage(asset.key, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                
                {websiteAssets.length === 0 && (
                  <div className={styles.emptyBox}>لم يتم إضافة صور قابلة للتعديل بعد. استخدم ملف الإعدادات لإضافة المفاتيح.</div>
                )}
              </div>
            )}
          </div>
        ) : activeTab === 'products' ? (
          <div className={styles.websiteEditContainer}>
            <header className={styles.header}>
              <div>
                <h1 className={styles.headerTitle}>المنتجات</h1>
                <p className={styles.headerSub}>إدارة المنتجات وإضافة منتج جديد</p>
              </div>
              <div className={styles.headerActions}>
                <button className={styles.addBtn} onClick={() => { setSelectedProduct({}); setShowProductModal(true); }}>+ إضافة منتج</button>
              </div>
            </header>

            {/* Bulk Update Section */}
            <div className={styles.filtersRow} style={{ marginTop: '20px', backgroundColor: '#fdfbf7', padding: '15px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
              <strong style={{ marginLeft: '15px', color: '#6A311D' }}>تحديث أسعار قسم بالكامل:</strong>
              <select className={styles.filterSelect} value={bulkCategory} onChange={e => setBulkCategory(e.target.value)}>
                <option value="">اختر القسم...</option>
                {Array.from(new Set(products.map(p => p.category))).filter(Boolean).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input 
                type="number" 
                className={styles.formInput} 
                style={{ width: '150px' }} 
                placeholder="السعر للمتر" 
                value={bulkPrice} 
                onChange={e => setBulkPrice(e.target.value ? Number(e.target.value) : "")} 
              />
              <button 
                className={styles.saveBtn} 
                style={{ padding: '8px 16px', marginRight: 'auto' }} 
                onClick={handleBulkUpdatePrice} 
                disabled={saving || !bulkCategory || bulkPrice === ""}
              >
                {saving ? 'جاري التحديث...' : 'تطبيق'}
              </button>
            </div>
            
            {loadingProducts ? (
              <div className={styles.loadingBox}><span className={styles.spinner} />جاري التحميل...</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>الصورة</th><th>الاسم (عربي)</th><th>القسم</th><th>السعر</th><th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className={styles.tableRow}>
                        <td>{p.images && p.images[0] && <img src={p.images[0]} alt="img" style={{width:40,height:40,objectFit:'cover',borderRadius:4}} />}</td>
                        <td>{p.labelAr}</td>
                        <td>{p.category}</td>
                        <td>{p.price} ج.م</td>
                        <td>
                          <button onClick={() => { setSelectedProduct(p); setShowProductModal(true); }} className={styles.refreshBtn} style={{marginRight:8, padding: '4px 8px'}}>تعديل</button>
                          <button onClick={() => handleDeleteProduct(p.id)} className={styles.deleteBtn} style={{padding: '4px 8px'}}>حذف</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'orders' ? (
          <div className={styles.websiteEditContainer}>
            <header className={styles.header}>
              <div>
                <h1 className={styles.headerTitle}>الطلبات</h1>
                <p className={styles.headerSub}>إدارة طلبات الشراء عبر الموقع</p>
              </div>
              <div className={styles.headerActions}>
                <button className={styles.refreshBtn} onClick={fetchOrders}>تحديث</button>
              </div>
            </header>
            
            {loadingOrders ? (
              <div className={styles.loadingBox}><span className={styles.spinner} />جاري التحميل...</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>رقم الطلب</th><th>العميل</th><th>المنتج</th><th>المقاس</th><th>الإجمالي</th><th>الحالة</th><th>تفاصيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className={styles.tableRow} onClick={() => { setSelectedOrder(o); setShowOrderModal(true); }}>
                        <td dir="ltr" style={{ fontSize: '12px' }}>{o.id.split('-')[0]}</td>
                        <td>{o.client_name}<br/><span style={{ fontSize: '12px', color: '#666' }} dir="ltr">{o.client_phone}</span></td>
                        <td>{o.products?.label_ar || 'منتج محذوف'}</td>
                        <td dir="ltr">{o.width}x{o.height} cm</td>
                        <td>{o.total_price} ج.م</td>
                        <td>
                          <span className={`${styles.badge} ${
                            o.status === 'delivered' ? styles.statusCompleted :
                            o.status === 'shipped' ? styles.statusConfirmed :
                            o.status === 'cancelled' ? styles.statusCancelled :
                            styles.statusPending
                          }`}>
                            {o.status === 'pending' ? 'قيد الانتظار' : o.status === 'shipped' ? 'جاري التوصيل' : o.status === 'delivered' ? 'تم التوصيل' : 'ملغي'}
                          </span>
                        </td>
                        <td>
                          <button className={styles.refreshBtn} style={{padding: '4px 8px'}} onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); setShowOrderModal(true); }}>عرض</button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={7} style={{textAlign:'center', padding:'20px'}}>لا توجد طلبات بعد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* ── Product Modal ── */}
      {showProductModal && selectedProduct && (
        <div className={styles.overlay} onClick={() => setShowProductModal(false)}>
          <div className={styles.modal} style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedProduct.id ? 'تعديل المنتج' : 'إضافة منتج'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowProductModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>الاسم (عربي) *</label>
                  <input className={styles.formInput} value={selectedProduct.labelAr || ''} onChange={e => setSelectedProduct({ ...selectedProduct, labelAr: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>الاسم (إنجليزي) *</label>
                  <input className={styles.formInput} dir="ltr" value={selectedProduct.labelEn || ''} onChange={e => setSelectedProduct({ ...selectedProduct, labelEn: e.target.value })} />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>القسم</label>
                  <input className={styles.formInput} dir="ltr" value={selectedProduct.category || ''} onChange={e => setSelectedProduct({ ...selectedProduct, category: e.target.value })} placeholder="مثال: Roller, Smart, Classic" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>السعر</label>
                  <input className={styles.formInput} type="number" value={selectedProduct.price || 0} onChange={e => setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) })} />
                </div>

                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>الوصف القصير (عربي)</label>
                  <input className={styles.formInput} value={selectedProduct.descAr || ''} onChange={e => setSelectedProduct({ ...selectedProduct, descAr: e.target.value })} />
                </div>
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>الوصف القصير (إنجليزي)</label>
                  <input className={styles.formInput} dir="ltr" value={selectedProduct.descEn || ''} onChange={e => setSelectedProduct({ ...selectedProduct, descEn: e.target.value })} />
                </div>

                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>التفاصيل (عربي)</label>
                  <textarea className={`${styles.formInput} ${styles.formTextarea}`} value={selectedProduct.detailsAr || ''} onChange={e => setSelectedProduct({ ...selectedProduct, detailsAr: e.target.value })} />
                </div>
                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>التفاصيل (إنجليزي)</label>
                  <textarea className={`${styles.formInput} ${styles.formTextarea}`} dir="ltr" value={selectedProduct.detailsEn || ''} onChange={e => setSelectedProduct({ ...selectedProduct, detailsEn: e.target.value })} />
                </div>

                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>الصور المرفوعة ({selectedProduct.images?.length || 0})</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {selectedProduct.images?.map((img, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={img} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} alt="prod" />
                        <button onClick={() => setSelectedProduct({ ...selectedProduct, images: selectedProduct.images!.filter((_, index) => index !== i)})} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', border: 'none', cursor: 'pointer' }}>✕</button>
                      </div>
                    ))}
                  </div>
                  <label className={styles.uploadBtn}>
                    {uploadingProductImage ? 'جاري الرفع...' : '+ رفع صورة جديدة'}
                    <input type="file" accept="image/*" className={styles.hiddenInput} disabled={uploadingProductImage} onChange={e => { if (e.target.files?.[0]) handleUploadProductImage(e.target.files[0]); }} />
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>
                    <input type="checkbox" checked={selectedProduct.is_active !== false} onChange={e => setSelectedProduct({ ...selectedProduct, is_active: e.target.checked })} style={{ marginLeft: '8px' }} />
                    المنتج متاح (إلغاء التحديد يجعله نفذ من الكمية)
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>الألوان المتاحة</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(selectedProduct.colors || []).map((color, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f9f9f9', padding: '10px', borderRadius: '4px', flexWrap: 'wrap' }}>
                        <input type="color" value={color.hex} onChange={e => {
                          const newColors = [...(selectedProduct.colors || [])];
                          newColors[i].hex = e.target.value;
                          setSelectedProduct({ ...selectedProduct, colors: newColors });
                        }} style={{ width: '40px', height: '40px', cursor: 'pointer' }} />
                        <input className={styles.formInput} placeholder="الاسم (عربي)" value={color.nameAr} onChange={e => {
                          const newColors = [...(selectedProduct.colors || [])];
                          newColors[i].nameAr = e.target.value;
                          setSelectedProduct({ ...selectedProduct, colors: newColors });
                        }} style={{ width: '120px' }} />
                        <input className={styles.formInput} placeholder="Name (En)" value={color.nameEn} onChange={e => {
                          const newColors = [...(selectedProduct.colors || [])];
                          newColors[i].nameEn = e.target.value;
                          setSelectedProduct({ ...selectedProduct, colors: newColors });
                        }} dir="ltr" style={{ width: '120px' }} />
                        <label style={{ fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input type="checkbox" checked={color.isSoldOut} onChange={e => {
                            const newColors = [...(selectedProduct.colors || [])];
                            newColors[i].isSoldOut = e.target.checked;
                            setSelectedProduct({ ...selectedProduct, colors: newColors });
                          }} /> نفذت الكمية
                        </label>
                        {color.image && <img src={color.image} alt="color" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                        <label className={styles.uploadBtn} style={{ padding: '6px 12px', fontSize: '12px', margin: 0 }}>
                          رفع صورة
                          <input type="file" accept="image/*" className={styles.hiddenInput} onChange={async e => {
                            if (e.target.files?.[0]) {
                              const file = e.target.files[0];
                              try {
                                const fileExt = file.name.split('.').pop();
                                const fileName = `color-${Date.now()}.${fileExt}`;
                                const { error: uploadError } = await supabase.storage.from('product_images').upload(fileName, file);
                                if (uploadError) throw uploadError;
                                const { data: publicUrlData } = supabase.storage.from('product_images').getPublicUrl(fileName);
                                const newColors = [...(selectedProduct.colors || [])];
                                newColors[i].image = publicUrlData.publicUrl;
                                setSelectedProduct({ ...selectedProduct, colors: newColors });
                              } catch (err) { alert('فشل رفع الصورة'); }
                            }
                          }} />
                        </label>
                        <button onClick={() => {
                          const newColors = [...(selectedProduct.colors || [])];
                          newColors.splice(i, 1);
                          setSelectedProduct({ ...selectedProduct, colors: newColors });
                        }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>حذف</button>
                      </div>
                    ))}
                    <button onClick={() => {
                      setSelectedProduct({
                        ...selectedProduct,
                        colors: [...(selectedProduct.colors || []), { id: Date.now().toString(), nameEn: '', nameAr: '', hex: '#000000', isSoldOut: false }]
                      });
                    }} style={{ background: '#d4af37', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', width: 'max-content' }}>+ إضافة لون جديد</button>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveBtn} onClick={handleSaveProduct} disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ المنتج'}</button>
              <button className={styles.cancelBtn} onClick={() => setShowProductModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Order Modal ── */}
      {showOrderModal && selectedOrder && (
        <div className={styles.overlay} onClick={() => setShowOrderModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>تفاصيل الطلب</h2>
              <button className={styles.closeBtn} onClick={() => setShowOrderModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}><span className={styles.detailLabel}>رقم الطلب</span><span dir="ltr">{selectedOrder.id}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>المنتج</span><span>{selectedOrder.products?.label_ar || 'غير متاح'}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>اسم العميل</span><span>{selectedOrder.client_name}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>الهاتف</span><span dir="ltr">{selectedOrder.client_phone}</span></div>
                <div className={`${styles.detailItem} ${styles.detailFull}`}><span className={styles.detailLabel}>العنوان</span><span>{selectedOrder.client_address}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>المقاس (عرض × طول)</span><span dir="ltr">{selectedOrder.width} × {selectedOrder.height} سم</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>عدد القطع</span><span>{selectedOrder.pieces}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>لون / نوع</span><span>كود اللون: {selectedOrder.color_id} | كود النوع: {selectedOrder.type_id}</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>الإجمالي</span><span style={{color: '#b45309', fontWeight: 'bold'}}>{selectedOrder.total_price} ج.م</span></div>
                <div className={styles.detailItem}><span className={styles.detailLabel}>طريقة الدفع</span><span>الدفع عند الاستلام</span></div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>الحالة</span>
                  <select className={styles.modalSelect} value={selectedOrder.status}
                    onChange={e => updateOrderStatus(selectedOrder.id, e.target.value)} disabled={saving}>
                    <option value="pending">قيد الانتظار</option>
                    <option value="shipped">جاري التوصيل</option>
                    <option value="delivered">تم التوصيل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowOrderModal(false)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

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
