'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MotorProduct } from '@/lib/motorProducts';
import styles from '../admin.module.css';

interface Props {
  userRole: string | null;
}

const BRAND_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  somfy: { label: 'Somfy', color: '#d4af37', bg: '#d4af37' },
  azzurra: { label: 'Azzurra', color: '#0066b2', bg: '#0066b2' },
  azura: { label: 'Azzurra', color: '#0066b2', bg: '#0066b2' },
};

const CATEGORIES = ['zebra', 'sunscreen', 'sunlight', 'blackout', 'roman', 'dream', 'bamboo'];
const CATEGORY_LABELS: Record<string, string> = {
  zebra: 'زيبرا',
  sunscreen: 'صن سكرين',
  sunlight: 'صن لايت',
  blackout: 'بلاك اوت',
  roman: 'رومان',
  dream: 'دريم',
  bamboo: 'بامبو',
};

const EMPTY_FORM = {
  brand: 'somfy' as 'somfy' | 'azzurra' | 'azura',
  name_ar: '',
  name_en: '',
  desc_ar: '',
  desc_en: '',
  price: '',
  image: '',
  category: 'zebra',
  is_active: true,
  sort_order: 0,
};

export default function MotorProductsView({ userRole }: Props) {
  const [products, setProducts] = useState<MotorProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [brandFilter, setBrandFilter] = useState<'all' | 'somfy' | 'azzurra'>('all');
  const [catFilter, setCatFilter] = useState<string>('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('motor_products')
      .select('*')
      .order('brand', { ascending: true })
      .order('sort_order', { ascending: true });
    if (!error && data) {
      setProducts(data.map((row: any) => ({
        id: row.id,
        brand: row.brand,
        nameAr: row.name_ar || '',
        nameEn: row.name_en || '',
        descAr: row.desc_ar || '',
        descEn: row.desc_en || '',
        price: row.price || 0,
        image: row.image || '',
        category: row.category || 'zebra',
        is_active: row.is_active !== false,
        sort_order: row.sort_order || 0,
        created_at: row.created_at || '',
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setModalError(null);
    setShowModal(true);
  };

  const openEdit = (p: MotorProduct) => {
    setEditId(p.id);
    setForm({
      brand: p.brand,
      name_ar: p.nameAr,
      name_en: p.nameEn,
      desc_ar: p.descAr,
      desc_en: p.descEn,
      price: String(p.price),
      image: p.image,
      category: p.category,
      is_active: p.is_active,
      sort_order: p.sort_order,
    });
    setModalError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name_ar.trim()) { setModalError('يرجى إدخال الاسم بالعربي'); return; }
    setSaving(true);
    setModalError(null);
    const payload = {
      brand: form.brand,
      name_ar: form.name_ar.trim(),
      name_en: form.name_en.trim(),
      desc_ar: form.desc_ar.trim(),
      desc_en: form.desc_en.trim(),
      price: Number(form.price) || 0,
      image: form.image.trim(),
      category: form.category,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };

    let error;
    if (editId) {
      const res = await supabase.from('motor_products').update(payload).eq('id', editId);
      error = res.error;
    } else {
      const res = await supabase.from('motor_products').insert([payload]);
      error = res.error;
    }

    setSaving(false);
    if (error) {
      setModalError('خطأ أثناء الحفظ: ' + error.message);
    } else {
      setShowModal(false);
      fetchProducts();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل تريد حذف "${name}"؟`)) return;
    await supabase.from('motor_products').delete().eq('id', id);
    fetchProducts();
  };

  const handleToggleActive = async (p: MotorProduct) => {
    await supabase.from('motor_products').update({ is_active: !p.is_active }).eq('id', p.id);
    fetchProducts();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const ext = file.name.split('.').pop();
    const path = `motor_products/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
      setForm(f => ({ ...f, image: urlData.publicUrl }));
    }
    setUploadingImage(false);
  };

  const filteredProducts = products.filter(p => {
    if (brandFilter !== 'all') {
      if (brandFilter === 'somfy' && p.brand !== 'somfy') return false;
      if (brandFilter === 'azzurra' && p.brand !== 'azzurra' && p.brand !== 'azura') return false;
    }
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    return true;
  });

  const somfyCount = products.filter(p => p.brand === 'somfy').length;
  const azzurraCount = products.filter(p => p.brand === 'azzurra' || p.brand === 'azura').length;

  return (
    <div style={{ padding: '24px', direction: 'rtl' }}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>منتجات المحركات</h1>
          <p className={styles.headerSub}>
            {products.length} منتج إجمالي · {somfyCount} Somfy · {azzurraCount} Azzurra
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.addBtn} onClick={openAdd}>+ إضافة منتج</button>
        </div>
      </header>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        {/* Brand filter */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'somfy', 'azzurra'] as const).map(b => (
            <button
              key={b}
              onClick={() => setBrandFilter(b)}
              style={{
                padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
                border: '1.5px solid',
                borderColor: brandFilter === b ? (b === 'somfy' ? '#d4af37' : b === 'azzurra' ? '#0066b2' : '#3E2723') : '#e5e7eb',
                background: brandFilter === b ? (b === 'somfy' ? '#d4af37' : b === 'azzurra' ? '#0066b2' : '#3E2723') : 'white',
                color: brandFilter === b ? 'white' : '#6b7280',
              }}
            >
              {b === 'all' ? 'الكل' : b === 'somfy' ? 'Somfy' : 'Azzurra'}
            </button>
          ))}
        </div>

        <div style={{ height: '20px', width: '1px', background: '#e5e7eb' }} />

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCatFilter('all')}
            style={{
              padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
              border: '1.5px solid', borderColor: catFilter === 'all' ? '#3E2723' : '#e5e7eb',
              background: catFilter === 'all' ? '#3E2723' : 'white',
              color: catFilter === 'all' ? 'white' : '#6b7280',
            }}
          >الكل</button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              style={{
                padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
                border: '1.5px solid', borderColor: catFilter === c ? '#3E2723' : '#e5e7eb',
                background: catFilter === c ? '#3E2723' : 'white',
                color: catFilter === c ? 'white' : '#6b7280',
              }}
            >{CATEGORY_LABELS[c]}</button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', opacity: 0.3 }}>hourglass_empty</span>
          <p style={{ marginTop: '8px', fontSize: '13px' }}>جاري التحميل...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', opacity: 0.3 }}>inventory_2</span>
          <p style={{ marginTop: '8px', fontSize: '13px' }}>لا توجد منتجات</p>
          <button onClick={openAdd} style={{ marginTop: '16px', padding: '8px 20px', background: '#d4af37', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
            + إضافة أول منتج
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredProducts.map(p => {
            const brand = BRAND_LABELS[p.brand] || { label: p.brand, color: '#3E2723', bg: '#3E2723' };
            return (
              <div key={p.id} style={{
                background: 'white', border: '1px solid #f3f4f6', borderRadius: '16px', overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', opacity: p.is_active ? 1 : 0.55, transition: 'box-shadow 0.2s',
              }}>
                {/* Image */}
                <div style={{ position: 'relative', aspectRatio: '4/3', background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)', overflow: 'hidden' }}>
                  {p.image ? (
                    <img src={p.image} alt={p.nameAr} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#d1d5db' }}>precision_manufacturing</span>
                    </div>
                  )}
                  {/* Brand badge */}
                  <span style={{
                    position: 'absolute', top: '10px', right: '10px', background: brand.bg, color: 'white',
                    fontSize: '9px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase',
                  }}>{brand.label}</span>
                  {/* Inactive badge */}
                  {!p.is_active && (
                    <span style={{
                      position: 'absolute', top: '10px', left: '10px', background: '#6b7280', color: 'white',
                      fontSize: '9px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '999px',
                    }}>مخفي</span>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '13px', color: '#3E2723', lineHeight: 1.4, flex: 1 }}>{p.nameAr}</h3>
                    <span style={{ fontSize: '10px', color: '#9ca3af', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      {CATEGORY_LABELS[p.category] || p.category}
                    </span>
                  </div>
                  {p.nameEn && <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>{p.nameEn}</p>}
                  {p.descAr && (
                    <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.5, marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.descAr}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'black', fontSize: '15px', color: '#3E2723' }}>
                      {p.price.toLocaleString('ar-EG')} <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#9ca3af' }}>ج.م</span>
                    </span>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>ترتيب: {p.sort_order}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEdit(p)}
                      style={{ flex: 1, padding: '7px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}
                    >✎ تعديل</button>
                    <button
                      onClick={() => handleToggleActive(p)}
                      style={{ padding: '7px 10px', background: p.is_active ? '#fef3c7' : '#d1fae5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                      title={p.is_active ? 'إخفاء' : 'إظهار'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: p.is_active ? '#92400e' : '#065f46', verticalAlign: 'middle' }}>
                        {p.is_active ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.nameAr)}
                      style={{ padding: '7px 10px', background: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                      title="حذف"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#b91c1c', verticalAlign: 'middle' }}>delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', direction: 'rtl' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ fontWeight: 'bold', fontSize: '16px', color: '#3E2723' }}>
                {editId ? 'تعديل منتج' : 'إضافة منتج جديد'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '20px' }}>✕</button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Brand + Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                  الماركة
                  <select value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value as any }))}
                    style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }}>
                    <option value="somfy">Somfy (فرنسية)</option>
                    <option value="azzurra">Azzurra (إيطالية)</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                  الفئة
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </label>
              </div>

              {/* Names */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                  الاسم بالعربي *
                  <input value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))}
                    placeholder="مثال: موتور Movelite 35" dir="rtl"
                    style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                  الاسم بالإنجليزي
                  <input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                    placeholder="e.g. Movelite 35 Motor" dir="ltr"
                    style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }} />
                </label>
              </div>

              {/* Descriptions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                  الوصف بالعربي
                  <textarea value={form.desc_ar} onChange={e => setForm(f => ({ ...f, desc_ar: e.target.value }))}
                    rows={3} dir="rtl"
                    style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', resize: 'vertical' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                  الوصف بالإنجليزي
                  <textarea value={form.desc_en} onChange={e => setForm(f => ({ ...f, desc_en: e.target.value }))}
                    rows={3} dir="ltr"
                    style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', resize: 'vertical' }} />
                </label>
              </div>

              {/* Price + Sort */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                  السعر (ج.م)
                  <input type="number" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0"
                    style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                  ترتيب العرض
                  <input type="number" value={form.sort_order || ''} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                    placeholder="0"
                    style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }} />
                </label>
              </div>

              {/* Image */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                صورة المنتج
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="رابط الصورة أو ارفع ملف..."
                    style={{ flex: 1, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }} />
                  <label style={{ cursor: 'pointer', padding: '8px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                    {uploadingImage ? '...' : 'رفع صورة'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                {form.image && (
                  <img src={form.image} alt="preview" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb' }} />
                )}
              </label>

              {/* Active toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#374151' }}>
                <div
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  style={{
                    width: '42px', height: '24px', borderRadius: '999px', background: form.is_active ? '#d4af37' : '#d1d5db',
                    position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                    transition: 'right 0.2s, left 0.2s', right: form.is_active ? '3px' : 'auto', left: form.is_active ? 'auto' : '3px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
                <span>{form.is_active ? 'ظاهر على الموقع' : 'مخفي عن الموقع'}</span>
              </label>

              {/* Error */}
              {modalError && (
                <div style={{ padding: '10px 14px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '13px' }}>
                  {modalError}
                </div>
              )}

              {/* Footer Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 20px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#374151' }}
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ padding: '10px 24px', background: saving ? '#9ca3af' : '#d4af37', border: 'none', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 'bold', color: 'white' }}
                >
                  {saving ? 'جاري الحفظ...' : editId ? 'حفظ التعديلات' : 'إضافة المنتج'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
