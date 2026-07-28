'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductCategory } from '@/lib/products';
import styles from '../admin.module.css';

const EMPTY_FORM = {
  slug: '',
  name_ar: '',
  name_en: '',
  sort_order: 0,
};

export default function ProductCategoriesView() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setCategories(data.map((row: any) => ({
        id: row.id,
        slug: row.slug,
        nameAr: row.name_ar,
        nameEn: row.name_en,
        sort_order: row.sort_order || 0,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setModalError(null);
    setShowModal(true);
  };

  const openEdit = (cat: ProductCategory) => {
    setEditId(cat.id);
    setForm({
      slug: cat.slug,
      name_ar: cat.nameAr,
      name_en: cat.nameEn,
      sort_order: cat.sort_order,
    });
    setModalError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name_ar.trim() || !form.name_en.trim() || !form.slug.trim()) {
      setModalError('يرجى إدخال جميع الحقول المطلوبة (الاسم بالعربي، الاسم بالإنجليزي، والرمز)');
      return;
    }
    setSaving(true);
    setModalError(null);

    const payload = {
      slug: form.slug.trim(),
      name_ar: form.name_ar.trim(),
      name_en: form.name_en.trim(),
      sort_order: Number(form.sort_order) || 0,
    };

    let error;
    if (editId) {
      const res = await supabase.from('product_categories').update(payload).eq('id', editId);
      error = res.error;
    } else {
      const res = await supabase.from('product_categories').insert([payload]);
      error = res.error;
    }

    setSaving(false);
    if (error) {
      setModalError('خطأ أثناء الحفظ: ' + error.message);
    } else {
      setShowModal(false);
      fetchCategories();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل تريد حذف القسم "${name}"؟\nملاحظة: هذا لن يحذف المنتجات التي تنتمي لهذا القسم، لكنها قد لا تظهر بشكل صحيح.`)) return;
    await supabase.from('product_categories').delete().eq('id', id);
    fetchCategories();
  };

  return (
    <div style={{ padding: '24px', direction: 'rtl' }}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>أقسام المنتجات</h1>
          <p className={styles.headerSub}>إدارة الفئات التي تظهر في صفحة المنتجات</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.addBtn} onClick={openAdd}>+ إضافة قسم</button>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', opacity: 0.3 }}>hourglass_empty</span>
          <p style={{ marginTop: '8px', fontSize: '13px' }}>جاري التحميل...</p>
        </div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', opacity: 0.3 }}>category</span>
          <p style={{ marginTop: '8px', fontSize: '13px' }}>لا توجد أقسام</p>
          <button onClick={openAdd} style={{ marginTop: '16px', padding: '8px 20px', background: '#d4af37', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
            + إضافة أول قسم
          </button>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>الترتيب</th>
                <th>الرمز (Slug)</th>
                <th>الاسم (عربي)</th>
                <th>الاسم (إنجليزي)</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className={styles.tableRow}>
                  <td>{c.sort_order}</td>
                  <td dir="ltr" style={{ textAlign: 'right' }}>{c.slug}</td>
                  <td>{c.nameAr}</td>
                  <td>{c.nameEn}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEdit(c)} style={{ padding: '6px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                        تعديل
                      </button>
                      <button onClick={() => handleDelete(c.id, c.nameAr)} style={{ padding: '6px 12px', background: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#b91c1c' }}>
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', direction: 'rtl' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ fontWeight: 'bold', fontSize: '16px', color: '#3E2723' }}>
                {editId ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                الرمز (Slug) - يجب أن يكون فريداً وباللغة الإنجليزية بدون مسافات
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} dir="ltr" placeholder="مثال: zebra" style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                الاسم (عربي)
                <input value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} dir="rtl" placeholder="مثال: ستائر زيبرا" style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                الاسم (إنجليزي)
                <input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} dir="ltr" placeholder="e.g. Zebra Blinds" style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                ترتيب العرض
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} placeholder="0" style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }} />
              </label>

              {modalError && (
                <div style={{ padding: '10px 14px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '13px' }}>
                  {modalError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#374151' }}>إلغاء</button>
                <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: saving ? '#9ca3af' : '#d4af37', border: 'none', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 'bold', color: 'white' }}>
                  {saving ? 'جاري الحفظ...' : editId ? 'حفظ التعديلات' : 'إضافة القسم'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
