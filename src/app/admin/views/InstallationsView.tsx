'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase, Appointment } from '@/lib/supabase';

interface InstallationOrder extends Appointment {
  technician_name?: string;
  products_list?: string[];
  execution_photos?: string[];
  signature_data?: string | null;
}

export default function InstallationsView({ userRole }: { userRole: string | null }) {
  const [orders, setOrders] = useState<InstallationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Signature pad states
  const [activeSignOrder, setActiveSignOrder] = useState<InstallationOrder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Form states for execution upload
  const [activePhotoOrder, setActivePhotoOrder] = useState<InstallationOrder | null>(null);
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  // Techs list & manager states
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [showTechManagerModal, setShowTechManagerModal] = useState(false);
  const [newTechName, setNewTechName] = useState('');
  const [editingTechId, setEditingTechId] = useState<string | null>(null);
  const [editingTechName, setEditingTechName] = useState('');
  const [techSaving, setTechSaving] = useState(false);

  useEffect(() => {
    fetchInstallations();
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    let list: any[] = [];
    
    try {
      const saved = localStorage.getItem('crystal_blinds_technicians');
      if (saved) {
        list = JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const { data } = await supabase.from('profiles').select('id, name').eq('role', 'technician');
      if (data && data.length > 0) {
        const merged = [...list];
        data.forEach(dbTech => {
          if (!merged.some(t => t.name === dbTech.name || t.id === dbTech.id)) {
            merged.push(dbTech);
          }
        });
        list = merged;
      }
    } catch (e) {
      console.error(e);
    }

    if (!list || list.length === 0) {
      list = [
        { id: 't1', name: 'م. أحمد خالد' },
        { id: 't2', name: 'م. شريف مصطفى' }
      ];
    }

    setTechnicians(list);
    try {
      localStorage.setItem('crystal_blinds_technicians', JSON.stringify(list));
    } catch (e) {}
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
    } catch (e) {}

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

    const updated = technicians.map(t => (t.id === id ? { ...t, name: updatedName } : t));
    setTechnicians(updated);
    try {
      localStorage.setItem('crystal_blinds_technicians', JSON.stringify(updated));
    } catch (e) {}

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
    } catch (e) {}

    setTechSaving(false);
  };

  const handleUpdateTechnician = async (orderId: string, techName: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newNotes = JSON.stringify({
      tech: techName,
      products: order.products_list,
      photos: order.execution_photos,
      signature: order.signature_data
    });

    try {
      await supabase.from('appointments').update({ notes: newNotes }).eq('id', orderId);
    } catch (e) {
      console.error(e);
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, technician_name: techName } : o));
  };

  // Installation Order Create/Edit Modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<InstallationOrder | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  
  const [orderFormData, setOrderFormData] = useState({
    client_name: '',
    client_phone: '',
    client_address: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '12:00',
    technician_name: '',
    status: 'pending' as any,
  });

  const [productsInputList, setProductsInputList] = useState<string[]>(['']);

  const handleOpenAddOrder = () => {
    setEditingOrder(null);
    setOrderFormData({
      client_name: '',
      client_phone: '',
      client_address: '',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '12:00',
      technician_name: technicians[0]?.name || 'م. أحمد خالد',
      status: 'pending',
    });
    setProductsInputList(['ستائر زيبرا']);
    setShowOrderModal(true);
  };

  const handleOpenEditOrder = (order: InstallationOrder) => {
    setEditingOrder(order);
    setOrderFormData({
      client_name: order.client_name || '',
      client_phone: order.client_phone || '',
      client_address: order.client_address || '',
      appointment_date: order.appointment_date || new Date().toISOString().split('T')[0],
      appointment_time: order.appointment_time || '12:00',
      technician_name: order.technician_name || technicians[0]?.name || 'م. أحمد خالد',
      status: order.status || 'pending',
    });
    setProductsInputList(order.products_list && order.products_list.length > 0 ? order.products_list : ['']);
    setShowOrderModal(true);
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderFormData.client_name || !orderFormData.client_phone) {
      alert('يرجى ملء اسم العميل ورقم الهاتف.');
      return;
    }
    setSavingOrder(true);

    const validProducts = productsInputList.map(p => p.trim()).filter(Boolean);

    const packedNotes = JSON.stringify({
      tech: orderFormData.technician_name,
      products: validProducts.length > 0 ? validProducts : ['ستائر'],
      photos: editingOrder?.execution_photos || [],
      signature: editingOrder?.signature_data || null
    });

    const payload = {
      client_name: orderFormData.client_name,
      client_phone: orderFormData.client_phone,
      client_address: orderFormData.client_address,
      appointment_date: orderFormData.appointment_date,
      appointment_time: orderFormData.appointment_time,
      appointment_type: 'installation' as any,
      notes: packedNotes,
      status: orderFormData.status
    };

    try {
      if (editingOrder) {
        await supabase.from('appointments').update(payload).eq('id', editingOrder.id);
        setOrders(prev => prev.map(o => o.id === editingOrder.id ? {
          ...o,
          ...payload,
          technician_name: orderFormData.technician_name,
          products_list: validProducts
        } : o));
      } else {
        const { data, error } = await supabase.from('appointments').insert([payload]).select();
        if (!error && data && data[0]) {
          const newObj: InstallationOrder = {
            ...data[0],
            technician_name: orderFormData.technician_name,
            products_list: validProducts,
            execution_photos: [],
            signature_data: null
          };
          setOrders(prev => [newObj, ...prev]);
        } else {
          const mockObj: InstallationOrder = {
            id: 'INST-' + Math.floor(1000 + Math.random() * 9000),
            created_at: new Date().toISOString(),
            client_name: orderFormData.client_name,
            client_phone: orderFormData.client_phone,
            client_address: orderFormData.client_address,
            appointment_type: 'installation',
            appointment_date: orderFormData.appointment_date,
            appointment_time: orderFormData.appointment_time,
            status: orderFormData.status,
            technician_name: orderFormData.technician_name,
            products_list: validProducts,
            execution_photos: [],
            signature_data: null,
            curtain_type: '',
            notes: packedNotes
          };
          setOrders(prev => [mockObj, ...prev]);
        }
      }
    } catch (err) {
      console.error(err);
    }

    setSavingOrder(false);
    setShowOrderModal(false);
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('هل تريد حذف أمر التركيب هذا؟')) return;
    try {
      await supabase.from('appointments').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const fetchInstallations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_type', 'installation')
        .order('appointment_date', { ascending: false });
        
      if (error) throw error;

      const mapped: InstallationOrder[] = (data || []).map((item: any) => {
        let extra = { technician_name: 'م. أحمد خالد', products_list: ['ستائر زيبرا - غرف نوم'], execution_photos: [], signature_data: null };
        try {
          const parsed = JSON.parse(item.notes || '{}');
          extra = {
            technician_name: parsed.tech || 'م. أحمد خالد',
            products_list: parsed.products || ['ستائر زيبرا - غرف نوم'],
            execution_photos: parsed.photos || [],
            signature_data: parsed.signature || null
          };
        } catch {
          // Default mock
        }
        return { ...item, ...extra };
      });

      setOrders(mapped);
    } catch {
      // Mock Fallback
      setOrders([
        {
          id: 'INST-4001',
          created_at: '',
          client_name: 'ممدوح زكي',
          client_phone: '01002233445',
          client_address: 'العجوزة - ش النيل',
          appointment_type: 'installation',
          appointment_date: new Date().toISOString().split('T')[0],
          appointment_time: '11:00',
          status: 'confirmed',
          technician_name: 'م. شريف مصطفى',
          products_list: ['3 ستائر رول بلاك أوت', '2 ستائر دبل سيستم شيفون'],
          execution_photos: ['/photos for crystal/ستائر بلاك اوت.jpeg'],
          signature_data: null,
          curtain_type: '',
          notes: ''
        },
        {
          id: 'INST-4002',
          created_at: '',
          client_name: 'هالة خليل',
          client_phone: '01222998877',
          client_address: 'مدينتي - مجموعة 12',
          appointment_type: 'installation',
          appointment_date: new Date().toISOString().split('T')[0],
          appointment_time: '15:00',
          status: 'pending',
          technician_name: 'م. أحمد خالد',
          products_list: ['4 ستائر رومن خشبية زيبرا'],
          execution_photos: [],
          signature_data: null,
          curtain_type: '',
          notes: ''
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: any) => {
    try {
      await supabase.from('appointments').update({ status }).eq('id', orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    }
  };

  // ──── Signature Pad Logic ────
  const openSignModal = (order: InstallationOrder) => {
    setActiveSignOrder(order);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = '#2B1B17';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
        }
      }
    }, 100);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeSignOrder) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    
    // Save signature into Database packed inside notes
    const newNotes = JSON.stringify({
      tech: activeSignOrder.technician_name,
      products: activeSignOrder.products_list,
      photos: activeSignOrder.execution_photos,
      signature: dataUrl
    });

    try {
      await supabase.from('appointments').update({ notes: newNotes, status: 'completed' }).eq('id', activeSignOrder.id);
      setOrders(prev => prev.map(o => o.id === activeSignOrder.id ? { ...o, signature_data: dataUrl, status: 'completed' } : o));
    } catch {
      setOrders(prev => prev.map(o => o.id === activeSignOrder.id ? { ...o, signature_data: dataUrl, status: 'completed' } : o));
    }
    setActiveSignOrder(null);
  };

  // ──── Execution Photos Logic ────
  const addExecutionPhoto = async () => {
    if (!activePhotoOrder || !photoUrlInput) return;
    
    const updatedPhotos = [...(activePhotoOrder.execution_photos || []), photoUrlInput];
    
    const newNotes = JSON.stringify({
      tech: activePhotoOrder.technician_name,
      products: activePhotoOrder.products_list,
      photos: updatedPhotos,
      signature: activePhotoOrder.signature_data
    });

    try {
      await supabase.from('appointments').update({ notes: newNotes }).eq('id', activePhotoOrder.id);
      setOrders(prev => prev.map(o => o.id === activePhotoOrder.id ? { ...o, execution_photos: updatedPhotos } : o));
    } catch {
      setOrders(prev => prev.map(o => o.id === activePhotoOrder.id ? { ...o, execution_photos: updatedPhotos } : o));
    }

    setPhotoUrlInput('');
    setActivePhotoOrder(null);
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
          <h1 className="text-xl md:text-2xl font-bold mb-1">أوامر التركيب والتسليم</h1>
          <p className="text-xs text-[#3E2723]/60">إجمالي أوامر التركيب الجارية: {orders.filter(o => o.status !== 'completed').length}</p>
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
              onClick={handleOpenAddOrder}
              className="flex items-center gap-2 bg-[#d4af37] text-[#2B1B17] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#b8922a] transition-all shadow-[0_2px_8px_rgba(212,175,55,0.25)]"
            >
              <span className="material-symbols-outlined text-base">build_circle</span>
              <span>إنشاء أمر تركيب</span>
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filterStatus === status 
                  ? 'bg-[#3E2723] text-white border-[#3E2723]' 
                  : 'bg-white text-[#3E2723]/70 border-[#3E2723]/10 hover:border-[#3E2723]/30'
              }`}
            >
              {status === 'all' ? 'الكل' : 
               status === 'pending' ? 'قيد الانتظار' :
               status === 'confirmed' ? 'مؤكد' : 
               status === 'completed' ? 'مكتمل' : 'ملغي'}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64 relative">
          <input
            type="text"
            placeholder="بحث بالعميل أو الفني..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
          />
          <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#3E2723]/40 text-sm">search</span>
        </div>
      </div>

      {/* Installation Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white p-5 rounded-2xl border border-[#3E2723]/10 flex flex-col justify-between gap-4">
            
            <div className="flex justify-between items-start">
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-[#3E2723]/50">رقم أمر التركيب</span>
                <span className="font-extrabold text-sm text-[#3E2723]" dir="ltr">{order.id?.includes('-') ? order.id.split('-')[0] : order.id}</span>
              </div>
              <div className="flex items-center gap-2">
                {userRole === 'admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditOrder(order)}
                      className="p-1 text-[#3E2723]/60 hover:text-[#b8922a] rounded-lg hover:bg-[#3E2723]/5 transition-colors"
                      title="تعديل أمر التركيب"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-1 text-red-500/70 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="حذف أمر التركيب"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                )}
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                  order.status === 'completed' ? 'bg-green-500/10 text-green-700' :
                  order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-700' :
                  'bg-yellow-500/10 text-yellow-700'
                }`}>
                  {order.status === 'completed' ? 'مكتمل' : order.status === 'confirmed' ? 'مؤكد' : 'قيد الانتظار'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-[#3E2723]/80">
              <div><b>العميل:</b> {order.client_name}</div>
              <div><b>الهاتف:</b> <span className="select-all">{order.client_phone}</span></div>
              <div><b>العنوان:</b> {order.client_address}</div>
              <div>
                <b>الفني المسئول:</b>{' '}
                {userRole === 'admin' ? (
                  <select
                    value={order.technician_name || ''}
                    onChange={e => handleUpdateTechnician(order.id, e.target.value)}
                    className="border border-[#3E2723]/20 rounded-lg px-2 py-0.5 bg-[#FAF8F5] text-xs font-bold text-[#b8922a] outline-none cursor-pointer"
                  >
                    {technicians.map(t => (
                      <option key={t.id || t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="font-bold text-[#b8922a]">{order.technician_name}</span>
                )}
              </div>
              <div><b>موعد التركيب:</b> {order.appointment_date} في تمام {order.appointment_time}</div>
              
              {/* Products list */}
              <div className="mt-2">
                <span className="text-[10px] font-bold text-[#3E2723]/50 block mb-1">المنتجات المطلوب تركيبها:</span>
                <ul className="list-disc list-inside bg-[#FAF8F5] p-2 rounded-lg border border-[#3E2723]/5">
                  {order.products_list?.map((p, idx) => (
                    <li key={idx} className="font-semibold text-[#3E2723]/90">{p}</li>
                  ))}
                </ul>
              </div>

              {/* Uploaded Photos */}
              {order.execution_photos && order.execution_photos.length > 0 && (
                <div className="mt-2">
                  <span className="text-[10px] font-bold text-[#3E2723]/50 block mb-1">صور التنفيذ الفني:</span>
                  <div className="flex gap-2">
                    {order.execution_photos.map((img, i) => (
                      <div key={i} className="w-12 h-12 rounded-lg border border-[#3E2723]/10 overflow-hidden bg-gray-50">
                        <img src={img} alt="Tansim" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Signature display */}
              {order.signature_data && (
                <div className="mt-2 bg-green-50/50 p-2.5 rounded-lg border border-green-500/10 flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-600 text-lg">verified</span>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] text-green-700 font-bold">تم توقيع العميل بالاستلام الإلكتروني</span>
                    <img src={order.signature_data} alt="signature" className="h-6 object-contain filter grayscale" />
                  </div>
                </div>
              )}
            </div>

            {/* Actions Binds */}
            <div className="flex items-center justify-between border-t border-[#3E2723]/5 pt-3 mt-2 flex-wrap gap-2">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActivePhotoOrder(order)}
                  className="flex items-center gap-1 bg-white border border-[#3E2723]/15 text-[#3E2723] hover:border-[#d4af37] px-2.5 py-1.5 rounded-xl text-[10px] font-bold"
                >
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                  <span>رفع صورة تنفيذ</span>
                </button>
                
                {!order.signature_data && (
                  <button
                    onClick={() => openSignModal(order)}
                    className="flex items-center gap-1 bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#b8922a] hover:bg-[#d4af37]/20 px-2.5 py-1.5 rounded-xl text-[10px] font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">draw</span>
                    <span>توقيع واستلام العميل</span>
                  </button>
                )}
              </div>

              {userRole === 'admin' && (
                <select
                  value={order.status}
                  onChange={e => handleUpdateStatus(order.id, e.target.value as any)}
                  className="border border-[#3E2723]/25 rounded-lg px-2 py-1 bg-[#FAF8F5] text-[10px] font-bold outline-none"
                >
                  <option value="pending">🟡 قيد الانتظار</option>
                  <option value="confirmed">🔵 مؤكد</option>
                  <option value="completed">🟢 مكتمل</option>
                  <option value="cancelled">🔴 ملغي</option>
                </select>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Signature Capture Modal */}
      {activeSignOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[2000]">
          <div className="bg-white rounded-2xl border border-[#3E2723]/15 w-full max-w-sm shadow-2xl overflow-hidden text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#3E2723] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-xs">توقيع العميل الإلكتروني بالاستلام</h3>
              <button onClick={() => setActiveSignOrder(null)} className="text-white/60">✕</button>
            </div>
            
            <div className="p-4 flex flex-col gap-4">
              <p className="text-[11px] text-[#3E2723]/60">يرجى من العميل التوقيع داخل الإطار أدناه لتأكيد اكتمال التركيب والرضا عن الخدمة:</p>
              
              <canvas
                ref={canvasRef}
                width={320}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="mx-auto border-2 border-dashed border-[#3E2723]/20 bg-[#FAF8F5] rounded-xl cursor-crosshair touch-none"
              />

              <div className="flex gap-2 justify-center">
                <button
                  type="button" onClick={clearCanvas}
                  className="px-3 py-1.5 border border-[#3E2723]/20 rounded-lg text-[10px] font-bold hover:bg-[#3E2723]/5"
                >
                  مسح
                </button>
                <button
                  type="button" onClick={saveSignature}
                  className="px-4 py-1.5 bg-[#d4af37] text-[#2B1B17] font-bold rounded-lg text-[10px] hover:bg-[#b8922a]"
                >
                  حفظ وتأكيد الاستلام
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Url Upload Modal */}
      {activePhotoOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[2000]">
          <div className="bg-white rounded-2xl border border-[#3E2723]/15 w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#3E2723] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-xs">رفع صور تنفيذ التركيب</h3>
              <button onClick={() => setActivePhotoOrder(null)} className="text-white/60">✕</button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <label className="text-[10px] font-bold text-[#3E2723]/60">رابط صورة التنفيذ</label>
              <input
                type="text"
                placeholder="https://example.com/photo.jpg"
                value={photoUrlInput}
                onChange={e => setPhotoUrlInput(e.target.value)}
                className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
              />
              <div className="flex gap-2 justify-end mt-2">
                <button
                  onClick={() => setActivePhotoOrder(null)}
                  className="px-3 py-1.5 border border-[#3E2723]/20 rounded-lg text-[10px] font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={addExecutionPhoto}
                  className="px-4 py-1.5 bg-[#d4af37] text-[#2B1B17] font-bold rounded-lg text-[10px] hover:bg-[#b8922a]"
                >
                  إضافة الصورة
                </button>
              </div>
            </div>
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

      {/* Modal: Create or Edit Installation Order */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDFA] border border-white/60 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#3E2723]/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d4af37]">build_circle</span>
                <h3 className="font-bold text-[#3E2723] text-sm">
                  {editingOrder ? 'تعديل أمر التركيب' : 'إنشاء أمر تركيب جديد'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="text-[#3E2723]/40 hover:text-[#3E2723] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">اسم العميل *</label>
                  <input
                    type="text"
                    required
                    value={orderFormData.client_name}
                    onChange={e => setOrderFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                    placeholder="مثال: محمد السيد"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={orderFormData.client_phone}
                    onChange={e => setOrderFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                    placeholder="01000000000"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E2723]/70">عنوان التركيب</label>
                <input
                  type="text"
                  value={orderFormData.client_address}
                  onChange={e => setOrderFormData(prev => ({ ...prev, client_address: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                  placeholder="مثال: التجمع الخامس - النرجس عمارة 15"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">التاريخ</label>
                  <input
                    type="date"
                    value={orderFormData.appointment_date}
                    onChange={e => setOrderFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">الوقت</label>
                  <input
                    type="time"
                    value={orderFormData.appointment_time}
                    onChange={e => setOrderFormData(prev => ({ ...prev, appointment_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">الفني المسئول</label>
                  <select
                    value={orderFormData.technician_name}
                    onChange={e => setOrderFormData(prev => ({ ...prev, technician_name: e.target.value }))}
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
                    value={orderFormData.status}
                    onChange={e => setOrderFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                  >
                    <option value="pending">🟡 قيد الانتظار</option>
                    <option value="confirmed">🔵 مؤكد</option>
                    <option value="completed">🟢 مكتمل</option>
                    <option value="cancelled">🔴 ملغي</option>
                  </select>
                </div>
              </div>

              {/* Products list input */}
              <div className="flex flex-col gap-2 border border-[#3E2723]/10 p-3 rounded-xl bg-[#FAF8F5]/30">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">المنتجات المطلوب تركيبها</label>
                  <button
                    type="button"
                    onClick={() => setProductsInputList(prev => [...prev, ''])}
                    className="text-[10px] font-bold text-[#d4af37] hover:text-[#b8922a] flex items-center gap-1 border border-[#d4af37]/20 px-2 py-0.5 rounded-lg bg-[#d4af37]/5 transition-colors"
                  >
                    + إضافة بند منتج
                  </button>
                </div>
                <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {productsInputList.map((prodStr, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={prodStr}
                        placeholder="مثال: 3 ستائر رول بلاك أوت"
                        onChange={e => {
                          const val = e.target.value;
                          setProductsInputList(prev => prev.map((p, i) => i === idx ? val : p));
                        }}
                        className="flex-1 px-3 py-1.5 border border-[#3E2723]/15 rounded-lg text-xs outline-none bg-white focus:border-[#d4af37]"
                      />
                      <button
                        type="button"
                        disabled={productsInputList.length === 1}
                        onClick={() => setProductsInputList(prev => prev.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 disabled:opacity-30 p-1"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 mt-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border border-[#3E2723]/20 rounded-xl text-xs font-bold hover:bg-[#3E2723]/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingOrder}
                  className="px-5 py-2 bg-[#d4af37] text-[#2B1B17] font-bold rounded-xl text-xs hover:bg-[#b8922a] disabled:opacity-50"
                >
                  {savingOrder ? 'جاري الحفظ...' : editingOrder ? 'حفظ التعديلات' : 'إنشاء أمر التركيب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
