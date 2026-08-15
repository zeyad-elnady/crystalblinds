'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase, Appointment } from '@/lib/supabase';

interface InspectionOrder extends Appointment {
  technician_name?: string;
  dimensions?: { width: number; height: number; type: string; notes?: string }[];
  images?: string[];
}

export default function InspectionsView({ userRole, userProfile }: { userRole: string | null; userProfile: any }) {
  const [orders, setOrders] = useState<InspectionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Techs list for assignment
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [dimensionsList, setDimensionsList] = useState<{ width: number; height: number; type: string; notes?: string }[]>([]);

  // Technicians manager state
  const [showTechManagerModal, setShowTechManagerModal] = useState(false);
  const [newTechName, setNewTechName] = useState('');
  const [editingTechId, setEditingTechId] = useState<string | null>(null);
  const [editingTechName, setEditingTechName] = useState('');
  const [techSaving, setTechSaving] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<InspectionOrder | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_address: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
    technician_name: 'فني المعاينات',
    dimensions_json: '[]',
    images_json: '[]',
    status: 'pending' as any,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInspections();
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

  const handleAddTechnician = async () => {
    if (!newTechName.trim()) return;
    setTechSaving(true);
    const techName = newTechName.trim();
    const newId = 'tech_' + Date.now();
    const newTech = { id: newId, name: techName };

    try {
      await supabase.from('profiles').insert([{ id: newId, name: techName, role: 'technician' }]);
    } catch (e) {
      console.error(e);
    }

    const updated = [...technicians, newTech];
    setTechnicians(updated);
    try {
      localStorage.setItem('crystal_blinds_technicians', JSON.stringify(updated));
    } catch (e) { }

    setFormData(prev => ({ ...prev, technician_name: techName }));
    setNewTechName('');
    setTechSaving(false);
  };

  const handleEditTechnician = async (id: string) => {
    if (!editingTechName.trim()) return;
    setTechSaving(true);
    const updatedName = editingTechName.trim();

    try {
      await supabase.from('profiles').update({ name: updatedName }).eq('id', id);
    } catch (e) {
      console.error(e);
    }

    const updated = technicians.map(t => {
      if (t.id === id) {
        if (formData.technician_name === t.name) {
          setFormData(prev => ({ ...prev, technician_name: updatedName }));
        }
        return { ...t, name: updatedName };
      }
      return t;
    });

    setTechnicians(updated);
    try {
      localStorage.setItem('crystal_blinds_technicians', JSON.stringify(updated));
    } catch (e) { }

    setEditingTechId(null);
    setEditingTechName('');
    setTechSaving(false);
  };

  const handleDeleteTechnician = async (id: string, name: string) => {
    if (technicians.length <= 1) {
      alert('يجب أن تظل القائمة تحتوي على فني واحد على الأقل.');
      return;
    }
    if (!confirm(`هل تريد حذف الفني "${name}" من القائمة؟`)) return;

    setTechSaving(true);
    try {
      await supabase.from('profiles').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }

    const updated = technicians.filter(t => t.id !== id);
    setTechnicians(updated);
    try {
      localStorage.setItem('crystal_blinds_technicians', JSON.stringify(updated));
    } catch (e) { }

    if (formData.technician_name === name) {
      setFormData(prev => ({ ...prev, technician_name: updated[0]?.name || '' }));
    }
    setTechSaving(false);
  };

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_type', 'inspection')
        .order('appointment_date', { ascending: false });

      if (error) throw error;

      // Map schema columns and parse mocks for extra details (images, dimensions)
      const mapped: InspectionOrder[] = (data || []).map((item: any) => {
        let dimensions = [];
        let techName = '';
        let adminNotes = '';
        let images: string[] = [];
        try {
          const parsed = JSON.parse(item.notes || '{}');
          if (parsed && typeof parsed === 'object') {
            dimensions = Array.isArray(parsed.dimensions) ? parsed.dimensions : [];
            techName = parsed.tech || '';
            adminNotes = parsed.adminNotes || '';
            images = Array.isArray(parsed.images) ? parsed.images : [];
          }
        } catch {
          if (item.notes?.includes('Tech:')) {
            techName = item.notes.split('Tech:')[1]?.split(';')[0]?.trim() || '';
          }
          adminNotes = item.notes || '';
        }
        return {
          ...item,
          technician_name: techName,
          dimensions,
          images,
          notes: adminNotes
        };
      });

      setOrders(mapped);
    } catch (err: any) {
      console.error('Error fetching inspections:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingOrder(null);
    setFormData({
      client_name: '',
      client_phone: '',
      client_address: '',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '12:00',
      notes: '',
      technician_name: technicians[0]?.name || '',
      dimensions_json: '[]',
      images_json: '[]',
      status: 'pending',
    });
    setDimensionsList([{ width: 2.0, height: 2.5, type: 'رول', notes: '' }]);
    setShowModal(true);
  };

  const handleOpenEdit = (order: InspectionOrder) => {
    setEditingOrder(order);
    setFormData({
      client_name: order.client_name,
      client_phone: order.client_phone,
      client_address: order.client_address,
      appointment_date: order.appointment_date,
      appointment_time: order.appointment_time || '',
      notes: order.notes || '',
      technician_name: order.technician_name || technicians[0]?.name || '',
      dimensions_json: JSON.stringify(order.dimensions || []),
      images_json: JSON.stringify(order.images || []),
      status: order.status,
    });
    setDimensionsList(order.dimensions || []);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف أمر المعاينة هذا؟')) return;
    try {
      await supabase.from('appointments').delete().eq('id', id);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const handlePrint = (order: InspectionOrder) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dimensionsHtml = order.dimensions?.map((d, index) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${d.type}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${d.width} م</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${d.height} م</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #b8922a;">${(d.width * d.height).toFixed(2)} م²</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${d.notes || '—'}</td>
      </tr>
    `).join('') || '<tr><td colspan="6" style="padding: 12px; text-align: center; color: #999;">لا يوجد مقاسات مسجلة بعد</td></tr>';

    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>أمر معاينة - رقم ${order.id?.includes('-') ? order.id.split('-')[0] : order.id}</title>
          <style>
            body { font-family: 'Tajawal', sans-serif; color: #333; padding: 20px; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3E2723; padding-bottom: 15px; margin-bottom: 30px; }
            .header img { height: 60px; }
            .title { font-size: 20px; font-weight: bold; color: #3E2723; }
            .grid { display: grid; grid-cols-2; display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; }
            .info-box { flex: 1; min-width: 250px; background: #FAF8F5; border: 1px solid #ddd; padding: 15px; border-radius: 10px; }
            .info-box h3 { margin-top: 0; color: #b8922a; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #FAF8F5; color: #3E2723; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">أمر معاينة ورفع مقاسات</div>
              <div style="font-size: 12px; color: #777;">رقم المعاينة: ${order.id?.includes('-') ? order.id.split('-')[0] : order.id}</div>
            </div>
            <img src="/logo.png" alt="Crystal Blinds" onerror="this.style.display='none'" />
          </div>
          
          <div class="grid">
            <div class="info-box">
              <h3>بيانات العميل</h3>
              <div><b>الاسم:</b> ${order.client_name}</div>
              <div><b>الهاتف:</b> ${order.client_phone}</div>
              <div><b>العنوان:</b> ${order.client_address}</div>
            </div>
            <div class="info-box">
              <h3>تفاصيل المعاينة</h3>
              <div><b>الفني المسئول:</b> ${order.technician_name}</div>
              <div><b>تاريخ المعاينة:</b> ${order.appointment_date}</div>
              <div><b>وقت المعاينة:</b> ${order.appointment_time}</div>
              <div><b>ملاحظات الإدارة:</b> ${order.notes || '—'}</div>
            </div>
          </div>
          
          <div class="title" style="font-size: 16px; margin-top: 20px;">جدول المقاسات والمواصفات</div>
          <table>
            <thead>
              <tr style="background: #3E2723; color: white;">
                <th style="padding: 8px; border: 1px solid #ddd;">م</th>
                <th style="padding: 8px; border: 1px solid #ddd;">نوع الستارة</th>
                <th style="padding: 8px; border: 1px solid #ddd;">العرض (W)</th>
                <th style="padding: 8px; border: 1px solid #ddd;">الارتفاع (H)</th>
                <th style="padding: 8px; border: 1px solid #ddd;">المساحة</th>
                <th style="padding: 8px; border: 1px solid #ddd;">الملاحظات الفنية</th>
              </tr>
            </thead>
            <tbody>
              ${dimensionsHtml}
            </tbody>
          </table>

          <div style="margin-top: 60px; display: flex; justify-content: space-between;">
            <div style="text-align: center;">توقيع فني المعاينة: ___________________</div>
            <div style="text-align: center;">توقيع العميل بالاستلام: ___________________</div>
          </div>

          <div class="no-print" style="margin-top: 40px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #d4af37; color: #2B1B17; font-weight: bold; border: none; border-radius: 5px; cursor: pointer;">إجراء الطباعة / حفظ PDF</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Package technician and extra variables inside notes JSON string for simplicity
    const packedNotes = JSON.stringify({
      tech: formData.technician_name,
      dimensions: dimensionsList,
      adminNotes: formData.notes
    });

    const payload = {
      client_name: formData.client_name,
      client_phone: formData.client_phone,
      client_address: formData.client_address,
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time,
      appointment_type: 'inspection' as any,
      notes: packedNotes,
      status: formData.status
    };

    try {
      if (editingOrder) {
        await supabase.from('appointments').update(payload).eq('id', editingOrder.id);
      } else {
        await supabase.from('appointments').insert([payload]);
      }
      setShowModal(false);
      fetchInspections();
    } catch {
      // Simulation offline save
      if (editingOrder) {
        setOrders(prev => prev.map(o => o.id === editingOrder.id ? { ...o, ...payload, technician_name: formData.technician_name, dimensions: dimensionsList } : o));
      } else {
        const mockNew: InspectionOrder = {
          id: 'INSP-' + String(Date.now()).slice(-4),
          client_name: formData.client_name,
          client_phone: formData.client_phone,
          client_address: formData.client_address,
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          appointment_type: 'inspection',
          status: formData.status,
          technician_name: formData.technician_name,
          dimensions: dimensionsList,
          images: [],
          curtain_type: '',
          notes: packedNotes,
          created_at: new Date().toISOString()
        };
        setOrders(prev => [mockNew, ...prev]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;
      const matchSearch = o.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.client_phone.includes(searchQuery) ||
        o.technician_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, filterStatus, searchQuery]);

  return (
    <div className="flex flex-col gap-6 text-[#3E2723]" style={{ direction: 'rtl' }}>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">أوامر المعاينة ورفع المقاسات</h1>
          <p className="text-xs text-[#3E2723]/60">إجمالي طلبات المعاينة الجارية: {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}</p>
        </div>
        {userRole !== 'technician' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTechManagerModal(true)}
              className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#3E2723]/20 text-[#3E2723] font-bold px-3.5 py-2 rounded-xl text-xs hover:bg-[#d4af37]/10 hover:border-[#d4af37] transition-all"
            >
              <span className="material-symbols-outlined text-base text-[#b8922a]">engineering</span>
              <span>إدارة قائمة الفنيين</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-[#d4af37] text-[#2B1B17] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#b8922a] transition-all shadow-[0_2px_8px_rgba(212,175,55,0.25)]"
            >
              <span className="material-symbols-outlined text-base">assignment_add</span>
              <span>إنشاء أمر معاينة</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#3E2723]/10">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterStatus === status
                ? 'bg-[#3E2723] text-white border-[#3E2723]'
                : 'bg-white text-[#3E2723]/70 border-[#3E2723]/10 hover:border-[#3E2723]/30'
                }`}
            >
              {status === 'all' ? 'الكل' :
                status === 'pending' ? 'جديد / قيد الانتظار' :
                  status === 'confirmed' ? 'مؤكد' :
                    status === 'completed' ? 'مكتمل' : 'ملغي'}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64 relative">
          <input
            type="text"
            placeholder="بحث باسم العميل أو الفني..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
          />
          <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#3E2723]/40 text-sm">search</span>
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="bg-white p-16 rounded-2xl border border-[#3E2723]/10 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#3E2723]/10 border-top-[#d4af37] rounded-full animate-spin" />
          <span className="text-xs text-[#3E2723]/60">جاري تحميل أوامر المعاينة...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-20 text-center rounded-2xl border border-[#3E2723]/10 text-[#3E2723]/40 flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl">assignment_late</span>
          <span className="text-xs font-bold">لا توجد أوامر معاينة جارية</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow flex flex-col justify-between gap-4">

              <div className="flex justify-between items-start">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-[#3E2723]/50">رقم المعاينة</span>
                  <span className="font-extrabold text-sm text-[#3E2723]" dir="ltr">{order.id?.includes('-') ? order.id.split('-')[0] : order.id}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${order.status === 'completed' ? 'bg-green-500/10 text-green-700' :
                  order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-700' :
                    order.status === 'cancelled' ? 'bg-red-500/10 text-red-700' :
                      'bg-yellow-500/10 text-yellow-700'
                  }`}>
                  {order.status === 'completed' ? 'مكتمل' : order.status === 'confirmed' ? 'مؤكد' : order.status === 'cancelled' ? 'ملغي' : 'قيد الانتظار'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <div><b>العميل:</b> {order.client_name}</div>
                <div><b>الهاتف:</b> <span className="select-all font-medium">{order.client_phone}</span></div>
                <div><b>العنوان:</b> {order.client_address}</div>
                <div><b>الفني المكلف:</b> <span className="font-bold text-[#b8922a]">{order.technician_name}</span></div>
                <div><b>التاريخ والوقت:</b> {order.appointment_date} في تمام {order.appointment_time}</div>
                {order.dimensions && order.dimensions.length > 0 && (
                  <div className="mt-2 bg-[#FAF8F5] p-2.5 rounded-lg border border-[#3E2723]/5">
                    <span className="text-[10px] font-bold block mb-1 text-[#b8922a]">المقاسات المرفوعة:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {order.dimensions.map((d, i) => (
                        <span key={i} className="bg-white border border-[#3E2723]/10 px-2 py-0.5 rounded text-[10px] font-bold">
                          {d.type}: {d.width}×{d.height} (${(d.width * d.height).toFixed(1)} م²)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#3E2723]/5 mt-2">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handlePrint(order)}
                    className="flex items-center gap-1 bg-white border border-[#3E2723]/15 text-[#3E2723] hover:border-[#d4af37] px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                  >
                    <span className="material-symbols-outlined text-[13px]">print</span>
                    <span>طباعة</span>
                  </button>
                </div>

                {userRole !== 'technician' && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(order)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center border border-[#3E2723]/10 hover:border-[#d4af37] hover:text-[#d4af37]"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center border border-[#3E2723]/10 hover:border-red-500 hover:text-red-500"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[2000]" style={{ direction: 'rtl' }}>
          <div className="bg-white rounded-2xl border border-[#3E2723]/15 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#3E2723] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">{editingOrder ? 'تعديل أمر المعاينة' : 'إنشاء أمر معاينة جديد'}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5">
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
                <label className="text-[10px] font-bold text-[#3E2723]/70">عنوان المعاينة</label>
                <input
                  type="text"
                  value={formData.client_address}
                  onChange={e => setFormData(prev => ({ ...prev, client_address: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">التاريخ</label>
                  <input
                    type="date"
                    value={formData.appointment_date}
                    onChange={e => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">الوقت</label>
                  <input
                    type="time"
                    value={formData.appointment_time}
                    onChange={e => setFormData(prev => ({ ...prev, appointment_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">الفني المسئول</label>
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
                  <label className="text-[10px] font-bold text-[#3E2723]/70">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  >
                    <option value="pending">🟡 قيد الانتظار</option>
                    <option value="confirmed">🔵 مؤكد</option>
                    <option value="completed">🟢 مكتمل</option>
                    <option value="cancelled">🔴 ملغي</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 border border-[#3E2723]/10 p-3.5 rounded-xl bg-[#FAF8F5]/30">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">جدول المقاسات</label>
                  <button
                    type="button"
                    onClick={() => setDimensionsList(prev => [...prev, { width: 0, height: 0, type: 'رول', notes: '' }])}
                    className="text-[10px] font-bold text-[#d4af37] hover:text-[#b8922a] flex items-center gap-1 border border-[#d4af37]/20 px-2 py-1 rounded-lg bg-[#d4af37]/5 transition-colors"
                  >
                    + إضافة مقاس
                  </button>
                </div>

                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                  {dimensionsList.map((dim, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#FAF8F5] p-2.5 rounded-xl border border-[#3E2723]/5">
                      <div className="col-span-3 flex flex-col gap-0.5">
                        <span className="text-[9px] text-[#3E2723]/50">نوع الستارة</span>
                        <input
                          type="text"
                          value={dim.type}
                          placeholder="رول"
                          onChange={e => {
                            const val = e.target.value;
                            setDimensionsList(prev => prev.map((d, i) => i === idx ? { ...d, type: val } : d));
                          }}
                          className="w-full px-2 py-1 border border-[#3E2723]/15 rounded-lg text-xs outline-none bg-white"
                        />
                      </div>
                      <div className="col-span-2 flex flex-col gap-0.5">
                        <span className="text-[9px] text-[#3E2723]/50">العرض (م)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={dim.width || ''}
                          placeholder="0.0"
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            setDimensionsList(prev => prev.map((d, i) => i === idx ? { ...d, width: val } : d));
                          }}
                          className="w-full px-2 py-1 border border-[#3E2723]/15 rounded-lg text-xs outline-none bg-white"
                        />
                      </div>
                      <div className="col-span-2 flex flex-col gap-0.5">
                        <span className="text-[9px] text-[#3E2723]/50">الارتفاع (م)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={dim.height || ''}
                          placeholder="0.0"
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            setDimensionsList(prev => prev.map((d, i) => i === idx ? { ...d, height: val } : d));
                          }}
                          className="w-full px-2 py-1 border border-[#3E2723]/15 rounded-lg text-xs outline-none bg-white"
                        />
                      </div>
                      <div className="col-span-4 flex flex-col gap-0.5">
                        <span className="text-[9px] text-[#3E2723]/50">الملاحظات</span>
                        <input
                          type="text"
                          value={dim.notes || ''}
                          placeholder="ملاحظة"
                          onChange={e => {
                            const val = e.target.value;
                            setDimensionsList(prev => prev.map((d, i) => i === idx ? { ...d, notes: val } : d));
                          }}
                          className="w-full px-2 py-1 border border-[#3E2723]/15 rounded-lg text-xs outline-none bg-white"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center pt-3">
                        <button
                          type="button"
                          disabled={dimensionsList.length === 1}
                          onClick={() => setDimensionsList(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E2723]/70">ملاحظات الإدارة</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none resize-none"
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
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Technician Management */}
      {showTechManagerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDFA] border border-white/60 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#3E2723]/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d4af37]">engineering</span>
                <h3 className="font-bold text-[#3E2723] text-sm">إدارة قائمة الفنيين</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTechManagerModal(false)}
                className="text-[#3E2723]/40 hover:text-[#3E2723] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Add New Technician */}
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                value={newTechName}
                onChange={e => setNewTechName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTechnician(); } }}
                placeholder="اسم الفني الجديد (مثال: م. محمود علي)"
                className="flex-1 px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
              />
              <button
                type="button"
                onClick={handleAddTechnician}
                disabled={techSaving || !newTechName.trim()}
                className="px-3 py-2 bg-[#d4af37] hover:bg-[#b8922a] text-[#2B1B17] font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 disabled:opacity-50 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>إضافة</span>
              </button>
            </div>

            {/* Current Technicians List */}
            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
              {technicians.length === 0 ? (
                <p className="text-center text-xs text-[#3E2723]/50 py-4">لا يوجد فنيين في القائمة</p>
              ) : (
                technicians.map((t) => (
                  <div
                    key={t.id || t.name}
                    className="flex items-center justify-between p-2.5 bg-[#FAF8F5] border border-[#3E2723]/10 rounded-xl hover:border-[#3E2723]/20 transition-all"
                  >
                    {editingTechId === t.id ? (
                      <div className="flex items-center gap-2 flex-1 ml-2">
                        <input
                          type="text"
                          value={editingTechName}
                          onChange={e => setEditingTechName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleEditTechnician(t.id); } }}
                          className="flex-1 px-2.5 py-1 border border-[#d4af37] rounded-lg text-xs outline-none bg-white font-bold text-[#3E2723]"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleEditTechnician(t.id)}
                          className="p-1 text-emerald-600 hover:text-emerald-700 font-bold"
                          title="حفظ التعديل"
                        >
                          <span className="material-symbols-outlined text-base">check</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTechId(null)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="إلغاء"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-[#b8922a]">person</span>
                          <span className="text-xs font-bold text-[#3E2723]">{t.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => { setEditingTechId(t.id); setEditingTechName(t.name); }}
                            className="p-1.5 text-[#3E2723]/60 hover:text-[#b8922a] rounded-lg hover:bg-[#3E2723]/5 transition-colors"
                            title="تعديل الاسم"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTechnician(t.id, t.name)}
                            className="p-1.5 text-red-500/70 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="حذف الفني"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-[#3E2723]/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTechManagerModal(false)}
                className="px-5 py-2 bg-[#3E2723] text-white font-bold text-xs rounded-xl hover:bg-[#2B1B17] transition-colors"
              >
                تم
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
