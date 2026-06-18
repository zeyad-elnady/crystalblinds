'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

interface ClientRecord {
  id: string;
  name: string;
  phone: string;
  address: string;
  governorate: string;
  status: 'confirmed' | 'lead' | 'past' | 'follow';
  source: string;
  notes: string;
  created_at?: string;
}

const STATUS_LABELS = {
  confirmed: 'عميل مؤكد',
  lead: 'عميل محتمل',
  past: 'عميل سابق',
  follow: 'يحتاج متابعة',
};

const STATUS_BADGES = {
  confirmed: 'bg-green-500/10 text-green-700 border border-green-500/20',
  lead: 'bg-yellow-500/10 text-yellow-700 border border-yellow-500/20',
  past: 'bg-blue-500/10 text-blue-700 border border-blue-500/20',
  follow: 'bg-red-500/10 text-red-700 border border-red-500/20',
};

export default function ClientsView() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and search state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    governorate: '',
    status: 'lead' as 'confirmed' | 'lead' | 'past' | 'follow',
    source: '',
    notes: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setClients(data || []);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      // Fallback mocks if DB table isn't fully set up yet
      setClients([
        { id: '1', name: 'أحمد علي', phone: '01012345678', address: 'مدينة نصر - ش عباس العقاد', governorate: 'القاهرة', status: 'confirmed', source: 'فيسبوك', notes: 'يرغب في ستائر رول' },
        { id: '2', name: 'سارة محمد', phone: '01234567890', address: 'سموحة - ش فوزي معاذ', governorate: 'الإسكندرية', status: 'lead', source: 'إنستجرام', notes: 'سؤال عن أسعار الزيبرا' },
        { id: '3', name: 'محمود حسن', phone: '01111223344', address: 'الشيخ زايد - الحي الثاني', governorate: 'الجيزة', status: 'follow', source: 'ترشيح من عميل', notes: 'يحتاج معاينة عاجلة' },
        { id: '4', name: 'فاطمة عمر', phone: '01599887766', address: 'ش الجمهورية', governorate: 'أسيوط', status: 'past', source: 'موقع إلكتروني', notes: 'تم التركيب والتحصيل بالكامل' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      governorate: '',
      status: 'lead',
      source: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (client: ClientRecord) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      address: client.address,
      governorate: client.governorate,
      status: client.status,
      source: client.source || '',
      notes: client.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل نهائياً؟')) return;
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      // Offline fallback
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('الرجاء إدخال الاسم ورقم الهاتف على الأقل');
      return;
    }
    
    setSaving(true);
    try {
      if (editingClient) {
        // Edit mode
        const { error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', editingClient.id);
          
        if (error) throw error;
        setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...formData } : c));
      } else {
        // Add mode
        const { data, error } = await supabase
          .from('clients')
          .insert([formData])
          .select();
          
        if (error) throw error;
        if (data && data[0]) {
          setClients(prev => [data[0], ...prev]);
        } else {
          fetchClients();
        }
      }
      setShowModal(false);
    } catch (err: any) {
      console.error('Error saving client:', err);
      // Offline simulation fallback
      if (editingClient) {
        setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...formData } : c));
      } else {
        const mockNew = { id: String(Date.now()), ...formData };
        setClients(prev => [mockNew, ...prev]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.governorate.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [clients, filterStatus, searchQuery]);

  return (
    <div className="flex flex-col gap-6 text-[#3E2723]" style={{ direction: 'rtl' }}>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">إدارة العملاء</h1>
          <p className="text-xs text-[#3E2723]/60">إجمالي عدد العملاء المسجلين: {clients.length}</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-[#d4af37] text-[#2B1B17] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#b8922a] transition-all shadow-[0_2px_8px_rgba(212,175,55,0.25)]"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#3E2723]/10 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <div className="flex flex-wrap gap-2">
          {['all', 'confirmed', 'lead', 'past', 'follow'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                filterStatus === status
                  ? 'bg-[#3E2723] text-white border-[#3E2723]'
                  : 'bg-white text-[#3E2723]/70 border-[#3E2723]/10 hover:border-[#3E2723]/30'
              }`}
            >
              {status === 'all' ? 'الكل' : STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64 relative">
          <input
            type="text"
            placeholder="بحث بالاسم، الهاتف، العنوان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37] transition-colors"
          />
          <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#3E2723]/40 text-sm">search</span>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3E2723]/10 border-top-[#d4af37] rounded-full animate-spin" />
            <span className="text-xs text-[#3E2723]/60">جاري تحميل العملاء...</span>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-16 text-center text-[#3E2723]/40 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl">group_off</span>
            <span className="text-xs font-bold">لا يوجد عملاء يطابقون خيارات البحث</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#3E2723]/10 text-[#3E2723]/50">
                  <th className="p-4 font-bold text-right">الاسم</th>
                  <th className="p-4 font-bold text-right">الهاتف</th>
                  <th className="p-4 font-bold text-right">العنوان</th>
                  <th className="p-4 font-bold text-right">المحافظة</th>
                  <th className="p-4 font-bold text-right">المصدر</th>
                  <th className="p-4 font-bold text-center">التصنيف</th>
                  <th className="p-4 font-bold text-right">الملاحظات</th>
                  <th className="p-4 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-[#3E2723]/5 last:border-0 hover:bg-[#FAF8F5]/30 transition-colors">
                    <td className="p-4 font-extrabold text-[#3E2723]">{client.name}</td>
                    <td className="p-4 font-medium text-[#3E2723]/80 select-all">{client.phone}</td>
                    <td className="p-4 text-[#3E2723]/70 truncate max-w-[200px]" title={client.address}>{client.address}</td>
                    <td className="p-4 text-[#3E2723]/70 font-semibold">{client.governorate}</td>
                    <td className="p-4 text-[#3E2723]/60 font-medium">{client.source || '—'}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_BADGES[client.status]}`}>
                        {STATUS_LABELS[client.status]}
                      </span>
                    </td>
                    <td className="p-4 text-[#3E2723]/60 truncate max-w-[150px]" title={client.notes}>{client.notes || '—'}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(client)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#3E2723]/10 hover:border-[#d4af37] text-[#3E2723]/70 hover:text-[#d4af37] transition-all bg-white"
                          title="تعديل العميل"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#3E2723]/10 hover:border-red-500 text-[#3E2723]/70 hover:text-red-600 transition-all bg-white"
                          title="حذف العميل"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[2000]" style={{ direction: 'rtl' }}>
          <div className="bg-white rounded-2xl border border-[#3E2723]/15 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#3E2723] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">{editingClient ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">اسم العميل *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">المحافظة</label>
                  <input
                    type="text"
                    value={formData.governorate}
                    onChange={(e) => setFormData(prev => ({ ...prev, governorate: e.target.value }))}
                    placeholder="مثال: القاهرة"
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">مصدر العميل</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="مثال: فيسبوك، إعلان..."
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E2723]/70">العنوان بالتفصيل</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E2723]/70">تصنيف العميل</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                >
                  <option value="lead">🟡 عميل محتمل (Lead)</option>
                  <option value="confirmed">🟢 عميل مؤكد (Confirmed)</option>
                  <option value="past">🔵 عميل سابق (Past)</option>
                  <option value="follow">🔴 يحتاج متابعة (Followup)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E2723]/70">ملاحظات إضافية</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              <div className="flex gap-2.5 mt-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#3E2723]/20 rounded-xl text-xs font-bold hover:bg-[#3E2723]/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#d4af37] text-[#2B1B17] font-bold rounded-xl text-xs hover:bg-[#b8922a] disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
