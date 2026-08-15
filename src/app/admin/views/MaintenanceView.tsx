'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

interface MaintenanceRecord {
  id: string;
  problem_type: string;
  client_name: string;
  client_phone: string;
  client_address: string;
  technician_name: string;
  cost: number;
  parts_used: string;
  status: 'new' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
}

const STATUS_LABELS = {
  new: 'جديد',
  confirmed: 'مؤكد',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

const STATUS_BADGES = {
  new: 'bg-yellow-500/10 text-yellow-700 border border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-700 border border-blue-500/20',
  in_progress: 'bg-orange-500/10 text-orange-700 border border-orange-500/20',
  completed: 'bg-green-500/10 text-green-700 border border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-700 border border-red-500/20',
};

export default function MaintenanceView({ userRole }: { userRole: string | null }) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    problem_type: '',
    client_name: '',
    client_phone: '',
    client_address: '',
    technician_name: '',
    cost: 0,
    parts_used: '',
    status: 'new' as any,
  });

  const [technicians, setTechnicians] = useState<any[]>([]);

  useEffect(() => {
    fetchMaintenance();
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    let list: any[] = [];
    try {
      const { data: profData } = await supabase.from('profiles').select('id, name').eq('role', 'technician');
      const { data: empData } = await supabase.from('employees').select('id, name');
      
      const all: any[] = [];
      (profData || []).forEach(p => { if (p.name && !all.some(x => x.name === p.name)) all.push(p); });
      (empData || []).forEach(e => { if (e.name && !all.some(x => x.name === e.name)) all.push(e); });
      list = all;
    } catch (e) {
      console.error(e);
      list = [];
    }

    setTechnicians(list);
  };

  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const mapped = (data || []).map((item: any) => ({
        id: item.id,
        problem_type: item.problem_type,
        client_name: item.client_name,
        client_phone: item.client_phone || '',
        client_address: item.client_address || '',
        technician_name: item.technician_name || '',
        cost: Number(item.cost) || 0,
        parts_used: item.parts_used || '',
        status: item.status,
      }));
      setRecords(mapped);
    } catch (err: any) {
      console.error('Error fetching maintenance records:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      problem_type: '',
      client_name: '',
      client_phone: '',
      client_address: '',
      technician_name: '',
      cost: 0,
      parts_used: '',
      status: 'new',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (rec: MaintenanceRecord) => {
    setEditingRecord(rec);
    setFormData({
      problem_type: rec.problem_type,
      client_name: rec.client_name,
      client_phone: rec.client_phone,
      client_address: rec.client_address,
      technician_name: rec.technician_name,
      cost: rec.cost,
      parts_used: rec.parts_used,
      status: rec.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف طلب الصيانة هذا؟')) return;
    try {
      await supabase.from('maintenance_orders').delete().eq('id', id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problem_type || !formData.client_name) {
      alert('الرجاء إدخال نوع المشكلة واسم العميل');
      return;
    }

    setSaving(true);
    const payload = {
      problem_type: formData.problem_type,
      client_name: formData.client_name,
      client_phone: formData.client_phone,
      client_address: formData.client_address,
      cost: formData.cost,
      parts_used: formData.parts_used,
      status: formData.status,
    };

    try {
      if (editingRecord) {
        await supabase.from('maintenance_orders').update(payload).eq('id', editingRecord.id);
        setRecords(prev => prev.map(r => r.id === editingRecord.id ? { ...r, ...payload, technician_name: formData.technician_name } : r));
      } else {
        const { data } = await supabase.from('maintenance_orders').insert([payload]).select();
        if (data && data[0]) {
          setRecords(prev => [{ ...data[0], technician_name: formData.technician_name, cost: Number(data[0].cost) }, ...prev]);
        } else {
          fetchMaintenance();
        }
      }
      setShowModal(false);
    } catch {
      // Offline Simulation
      if (editingRecord) {
        setRecords(prev => prev.map(r => r.id === editingRecord.id ? { ...r, ...payload, technician_name: formData.technician_name } : r));
      } else {
        const mockNew = { id: 'MAIN-' + String(Date.now()).slice(-3), ...payload, technician_name: formData.technician_name };
        setRecords(prev => [mockNew, ...prev]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchStatus = filterStatus === 'all' || r.status === filterStatus;
      const matchSearch = r.problem_type.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.technician_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [records, filterStatus, searchQuery]);

  return (
    <div className="flex flex-col gap-6 text-[#3E2723]" style={{ direction: 'rtl' }}>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">أوامر الصيانة والإصلاح</h1>
          <p className="text-xs text-[#3E2723]/60">إجمالي طلبات الصيانة المعلقة: {records.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length}</p>
        </div>
        {userRole !== 'technician' && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-[#d4af37] text-[#2B1B17] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#b8922a] transition-all"
          >
            <span className="material-symbols-outlined text-base">construction</span>
            <span>إنشاء أمر صيانة</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#3E2723]/10">
        <div className="flex flex-wrap gap-2">
          {['all', 'new', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
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
            placeholder="بحث بالمشكلة، العميل، الفني..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
          />
          <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#3E2723]/40 text-sm">search</span>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3E2723]/10 border-top-[#d4af37] rounded-full animate-spin" />
            <span className="text-xs text-[#3E2723]/60">جاري تحميل طلبات الصيانة...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-16 text-center text-[#3E2723]/40 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl">build_circle</span>
            <span className="text-xs font-bold">لا يوجد طلبات صيانة حالياً</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#3E2723]/10 text-[#3E2723]/50">
                  <th className="p-4 font-bold text-right">المشكلة</th>
                  <th className="p-4 font-bold text-right">العميل</th>
                  <th className="p-4 font-bold text-right">الهاتف</th>
                  <th className="p-4 font-bold text-right">الفني</th>
                  <th className="p-4 font-bold text-right">تكلفة الإصلاح</th>
                  <th className="p-4 font-bold text-right">القطع المستخدمة</th>
                  <th className="p-4 font-bold text-center">حالة التنفيذ</th>
                  <th className="p-4 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(rec => (
                  <tr key={rec.id} className="border-b border-[#3E2723]/5 last:border-0 hover:bg-[#FAF8F5]/30 transition-colors">
                    <td className="p-4 font-extrabold text-[#3E2723]">{rec.problem_type}</td>
                    <td className="p-4 font-bold text-[#3E2723]/80">{rec.client_name}</td>
                    <td className="p-4 text-[#3E2723]/70">{rec.client_phone}</td>
                    <td className="p-4 text-[#3E2723]/80 font-semibold text-[#b8922a]">{rec.technician_name}</td>
                    <td className="p-4 font-bold text-[#3E2723]">{rec.cost.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-4 text-[#3E2723]/60 max-w-[150px] truncate" title={rec.parts_used}>{rec.parts_used || '—'}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_BADGES[rec.status]}`}>
                        {STATUS_LABELS[rec.status]}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#3E2723]/10 hover:border-[#d4af37] text-[#3E2723]/70 hover:text-[#d4af37] bg-white"
                          title="تعديل صيانة"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>
                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleDelete(rec.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#3E2723]/10 hover:border-red-500 text-[#3E2723]/70 hover:text-red-600 bg-white"
                            title="حذف صيانة"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                          </button>
                        )}
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
              <h3 className="font-bold text-sm">{editingRecord ? 'تعديل أمر الصيانة' : 'إنشاء أمر صيانة جديد'}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E2723]/70">نوع المشكلة / العطل بالتفصيل *</label>
                <input
                  type="text" required
                  value={formData.problem_type}
                  onChange={e => setFormData(prev => ({ ...prev, problem_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">اسم العميل *</label>
                  <input
                    type="text" required
                    value={formData.client_name}
                    onChange={e => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">رقم الهاتف *</label>
                  <input
                    type="tel" required
                    value={formData.client_phone}
                    onChange={e => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E2723]/70">عنوان العميل بالتفصيل</label>
                <input
                  type="text"
                  value={formData.client_address}
                  onChange={e => setFormData(prev => ({ ...prev, client_address: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">الفني المكلف</label>
                  <select
                    value={formData.technician_name}
                    onChange={e => setFormData(prev => ({ ...prev, technician_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                  >
                    {technicians.map(t => (
                      <option key={t.id || t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">تكلفة الصيانة (ج.م)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={e => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  >
                    <option value="new">🟡 جديد</option>
                    <option value="confirmed">🔵 مؤكد</option>
                    <option value="in_progress">🟠 قيد التنفيذ</option>
                    <option value="completed">🟢 مكتمل</option>
                    <option value="cancelled">🔴 ملغي</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E2723]/70">القطع المستخدمة والإجراءات الفنية</label>
                <textarea
                  value={formData.parts_used}
                  onChange={e => setFormData(prev => ({ ...prev, parts_used: e.target.value }))}
                  rows={2.5}
                  placeholder="مثال: تغيير مجرى ستائر مقاس 2 متر، صيانة رول..."
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                />
              </div>

              <div className="flex gap-2.5 mt-3 justify-end">
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#3E2723]/20 rounded-xl text-xs font-bold hover:bg-[#3E2723]/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit" disabled={saving}
                  className="px-5 py-2 bg-[#d4af37] text-[#2B1B17] font-bold rounded-xl text-xs hover:bg-[#b8922a] disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ الصيانة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
