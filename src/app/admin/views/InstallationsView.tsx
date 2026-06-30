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

  useEffect(() => {
    fetchInstallations();
  }, []);

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
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                order.status === 'completed' ? 'bg-green-500/10 text-green-700' :
                order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-700' :
                'bg-yellow-500/10 text-yellow-700'
              }`}>
                {order.status === 'completed' ? 'مكتمل' : order.status === 'confirmed' ? 'مؤكد' : 'قيد الانتظار'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-[#3E2723]/80">
              <div><b>العميل:</b> {order.client_name}</div>
              <div><b>الهاتف:</b> <span className="select-all">{order.client_phone}</span></div>
              <div><b>العنوان:</b> {order.client_address}</div>
              <div><b>الفني المسئول:</b> <span className="font-bold text-[#b8922a]">{order.technician_name}</span></div>
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

    </div>
  );
}
