'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase, Appointment } from '@/lib/supabase';

export interface InstallationDimension {
  width: number;
  height: number;
  type: string;
  notes?: string;
}

export interface InstallationOrder extends Appointment {
  technician_name?: string;
  products_list?: string[];
  dimensions?: InstallationDimension[];
  total_price?: number;
  deposit?: number;
  collection_amount?: number;
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

  // Modal: Add / Edit Order State
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
    total_price: 0,
    deposit: 0,
    collection_amount: 0,
  });

  const [productsInputList, setProductsInputList] = useState<string[]>(['']);
  const [dimensionsList, setDimensionsList] = useState<InstallationDimension[]>([]);

  useEffect(() => {
    fetchInstallations();
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

    if (list.length === 0) {
      list = [
        { id: 't1', name: 'أحمد الفني' },
        { id: 't2', name: 'محمود التركيبات' },
        { id: 't3', name: 'إبراهيم الصيانة' }
      ];
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
    setTechSaving(false);
  };

  const handleUpdateTechnician = async (orderId: string, techName: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newNotes = JSON.stringify({
      tech: techName,
      products: order.products_list,
      dimensions: order.dimensions || [],
      total_price: order.total_price || 0,
      deposit: order.deposit || 0,
      collection_amount: order.collection_amount || 0,
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

  const handleOpenAddOrder = () => {
    setEditingOrder(null);
    setOrderFormData({
      client_name: '',
      client_phone: '',
      client_address: '',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '12:00',
      technician_name: technicians[0]?.name || 'فني التركيبات',
      status: 'pending',
      total_price: 0,
      deposit: 0,
      collection_amount: 0,
    });
    setProductsInputList(['ستائر زيبرا']);
    setDimensionsList([
      { width: 1.8, height: 2.2, type: 'ستائر زيبرا', notes: 'ريسبشن' }
    ]);
    setShowOrderModal(true);
  };

  const handleOpenEditOrder = (order: InstallationOrder) => {
    setEditingOrder(order);
    const tot = order.total_price || 0;
    const dep = order.deposit || 0;
    const coll = order.collection_amount !== undefined ? order.collection_amount : Math.max(0, tot - dep);

    setOrderFormData({
      client_name: order.client_name || '',
      client_phone: order.client_phone || '',
      client_address: order.client_address || '',
      appointment_date: order.appointment_date || new Date().toISOString().split('T')[0],
      appointment_time: order.appointment_time || '12:00',
      technician_name: order.technician_name || technicians[0]?.name || 'فني التركيبات',
      status: order.status || 'pending',
      total_price: tot,
      deposit: dep,
      collection_amount: coll,
    });
    setProductsInputList(order.products_list && order.products_list.length > 0 ? order.products_list : ['']);
    setDimensionsList(order.dimensions && order.dimensions.length > 0 ? order.dimensions : []);
    setShowOrderModal(true);
  };

  const handleAddDimensionRow = () => {
    setDimensionsList(prev => [
      ...prev,
      { width: 1.5, height: 2.0, type: 'ستائر رول', notes: '' }
    ]);
  };

  const handleRemoveDimensionRow = (idx: number) => {
    setDimensionsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDimensionChange = (idx: number, field: keyof InstallationDimension, value: any) => {
    setDimensionsList(prev => prev.map((dim, i) => {
      if (i === idx) {
        return { ...dim, [field]: value };
      }
      return dim;
    }));
  };

  const handlePriceChange = (field: 'total_price' | 'deposit' | 'collection_amount', val: number) => {
    setOrderFormData(prev => {
      const updated = { ...prev, [field]: val };
      if (field === 'total_price' || field === 'deposit') {
        const remaining = Math.max(0, (field === 'total_price' ? val : prev.total_price) - (field === 'deposit' ? val : prev.deposit));
        updated.collection_amount = remaining;
      }
      return updated;
    });
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderFormData.client_name || !orderFormData.client_phone) {
      alert('يرجى ملء اسم العميل ورقم الهاتف.');
      return;
    }
    setSavingOrder(true);

    const validProducts = productsInputList.map(p => p.trim()).filter(Boolean);
    const validDimensions = dimensionsList.filter(d => d.width > 0 && d.height > 0);

    const packedNotes = JSON.stringify({
      tech: orderFormData.technician_name,
      products: validProducts.length > 0 ? validProducts : (validDimensions.length > 0 ? validDimensions.map(d => d.type) : ['ستائر']),
      dimensions: validDimensions,
      total_price: Number(orderFormData.total_price) || 0,
      deposit: Number(orderFormData.deposit) || 0,
      collection_amount: Number(orderFormData.collection_amount) || 0,
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
          products_list: validProducts,
          dimensions: validDimensions,
          total_price: Number(orderFormData.total_price) || 0,
          deposit: Number(orderFormData.deposit) || 0,
          collection_amount: Number(orderFormData.collection_amount) || 0,
        } : o));
      } else {
        const { data, error } = await supabase.from('appointments').insert([payload]).select();
        if (!error && data && data[0]) {
          const newObj: InstallationOrder = {
            ...data[0],
            technician_name: orderFormData.technician_name,
            products_list: validProducts,
            dimensions: validDimensions,
            total_price: Number(orderFormData.total_price) || 0,
            deposit: Number(orderFormData.deposit) || 0,
            collection_amount: Number(orderFormData.collection_amount) || 0,
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
            dimensions: validDimensions,
            total_price: Number(orderFormData.total_price) || 0,
            deposit: Number(orderFormData.deposit) || 0,
            collection_amount: Number(orderFormData.collection_amount) || 0,
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

  const handlePrint = (order: InstallationOrder) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Build Dimensions Table HTML
    let dimensionsHtml = '';
    if (order.dimensions && order.dimensions.length > 0) {
      dimensionsHtml = order.dimensions.map((d, idx) => {
        const area = (Number(d.width || 0) * Number(d.height || 0)).toFixed(2);
        return `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${d.type || 'ستائر'}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center; direction: ltr;">${d.width} م</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center; direction: ltr;">${d.height} م</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; background: #fdfbf7;">${area} م²</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${d.notes || '—'}</td>
          </tr>
        `;
      }).join('');
    } else if (order.products_list && order.products_list.length > 0) {
      dimensionsHtml = order.products_list.map((p, idx) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${idx + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;" colspan="4">${p}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">قياسي</td>
        </tr>
      `).join('');
    } else {
      dimensionsHtml = `<tr><td colspan="6" style="padding: 12px; text-align: center; color: #888;">لا توجد مقاسات محددة</td></tr>`;
    }

    const totalPrice = Number(order.total_price || 0);
    const deposit = Number(order.deposit || 0);
    const collectionAmount = order.collection_amount !== undefined ? Number(order.collection_amount) : Math.max(0, totalPrice - deposit);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <title>أمر تركيب وتسليم — ${order.client_name}</title>
          <style>
            body { font-family: 'Tajawal', Arial, sans-serif; padding: 20px; color: #2B1B17; }
            .header { text-align: center; border-bottom: 2px solid #3E2723; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #3E2723; font-size: 24px; }
            .header p { margin: 5px 0 0 0; color: #666; font-size: 13px; }
            .grid { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
            .info-box { flex: 1; background: #faf8f5; border: 1px solid #e0d8cc; padding: 15px; border-radius: 8px; }
            .info-box h3 { margin-top: 0; color: #3E2723; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-size: 14px; }
            .info-box div { margin-bottom: 8px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            .title { font-weight: bold; color: #3E2723; font-size: 16px; margin-top: 25px; margin-bottom: 8px; }
            .collection-box {
              margin-top: 25px;
              background: #fffbeb;
              border: 2px solid #f59e0b;
              border-radius: 10px;
              padding: 16px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .collection-title { font-size: 16px; font-weight: bold; color: #92400e; }
            .collection-val { font-size: 22px; font-weight: 900; color: #b45309; }
            .collection-breakdown { font-size: 12px; color: #78350f; margin-top: 4px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>كريستال للستائر — أمر تركيب وتحصيل</h1>
            <p>Crystal Blinds — Installation & Collection Order</p>
          </div>
          
          <div class="grid">
            <div class="info-box">
              <h3>بيانات العميل</h3>
              <div><b>اسم العميل:</b> ${order.client_name}</div>
              <div><b>الهاتف:</b> ${order.client_phone}</div>
              <div><b>العنوان بالتفصيل:</b> ${order.client_address || '—'}</div>
            </div>
            <div class="info-box">
              <h3>تفاصيل أمر التركيب</h3>
              <div><b>رقم أمر التركيب:</b> #${order.id.slice(0, 8)}</div>
              <div><b>الفني المسئول:</b> ${order.technician_name || 'غير محدد'}</div>
              <div><b>موعد التركيب:</b> ${order.appointment_date || ''} — ${order.appointment_time || ''}</div>
              <div><b>الحالة:</b> ${order.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}</div>
            </div>
          </div>
          
          <!-- جدول المقاسات والمواصفات -->
          <div class="title">جدول المقاسات والمواصفات المطلوب تركيبها</div>
          <table>
            <thead>
              <tr style="background: #3E2723; color: white;">
                <th style="padding: 8px; border: 1px solid #ddd; width: 40px;">م</th>
                <th style="padding: 8px; border: 1px solid #ddd;">نوع الستارة والموديل</th>
                <th style="padding: 8px; border: 1px solid #ddd; width: 90px;">العرض (W)</th>
                <th style="padding: 8px; border: 1px solid #ddd; width: 90px;">الارتفاع (H)</th>
                <th style="padding: 8px; border: 1px solid #ddd; width: 90px;">المساحة</th>
                <th style="padding: 8px; border: 1px solid #ddd;">مكان التركيب والملاحظات الفنية</th>
              </tr>
            </thead>
            <tbody>
              ${dimensionsHtml}
            </tbody>
          </table>

          <!-- صندوق فلوس التحصيل والحسابات -->
          <div class="collection-box">
            <div>
              <div class="collection-title">المبلغ المطلوب تحصيله من العميل عند التركيب والتسليم</div>
              <div class="collection-breakdown">
                إجمالي قيمة الأمر: <b>${totalPrice.toLocaleString('ar-EG')} ج.م</b> | العربون المسدد: <b>${deposit.toLocaleString('ar-EG')} ج.م</b>
              </div>
            </div>
            <div class="collection-val">
              ${collectionAmount.toLocaleString('ar-EG')} ج.م
            </div>
          </div>

          <div style="margin-top: 60px; display: flex; justify-content: space-between;">
            <div style="text-align: center; font-size: 13px;">
              <b>توقيع الفني المستلم للتحصيل والمنفذ:</b><br/><br/>
              _________________________________
            </div>
            <div style="text-align: center; font-size: 13px;">
              <b>توقيع العميل بالاستلام وسداد المبلغ:</b><br/><br/>
              _________________________________
            </div>
          </div>

          <div class="no-print" style="margin-top: 40px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 24px; background: #d4af37; color: #2B1B17; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">إجراء الطباعة / حفظ PDF</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
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
        let extra = {
          technician_name: '',
          products_list: item.curtain_type ? [item.curtain_type] : [],
          dimensions: [] as InstallationDimension[],
          total_price: 0,
          deposit: 0,
          collection_amount: 0,
          execution_photos: [],
          signature_data: null
        };
        try {
          const parsed = JSON.parse(item.notes || '{}');
          if (parsed && typeof parsed === 'object') {
            extra = {
              technician_name: parsed.tech || '',
              products_list: Array.isArray(parsed.products) ? parsed.products : item.curtain_type ? [item.curtain_type] : [],
              dimensions: Array.isArray(parsed.dimensions) ? parsed.dimensions : [],
              total_price: Number(parsed.total_price) || 0,
              deposit: Number(parsed.deposit) || 0,
              collection_amount: parsed.collection_amount !== undefined ? Number(parsed.collection_amount) : Math.max(0, (Number(parsed.total_price) || 0) - (Number(parsed.deposit) || 0)),
              execution_photos: Array.isArray(parsed.photos) ? parsed.photos : [],
              signature_data: parsed.signature || null
            };
          }
        } catch {
          if (item.notes?.includes('Tech:')) {
            extra.technician_name = item.notes.split('Tech:')[1]?.split(';')[0]?.trim() || '';
          }
        }
        return { ...item, ...extra };
      });

      setOrders(mapped);
    } catch (err: any) {
      console.error('Error fetching installations:', err);
      setOrders([]);
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
    if (!activeSignOrder || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');

    const updatedNotes = JSON.stringify({
      tech: activeSignOrder.technician_name,
      products: activeSignOrder.products_list,
      dimensions: activeSignOrder.dimensions || [],
      total_price: activeSignOrder.total_price || 0,
      deposit: activeSignOrder.deposit || 0,
      collection_amount: activeSignOrder.collection_amount || 0,
      photos: activeSignOrder.execution_photos,
      signature: dataUrl
    });

    try {
      await supabase.from('appointments').update({
        notes: updatedNotes,
        status: 'completed'
      }).eq('id', activeSignOrder.id);

      setOrders(prev => prev.map(o => o.id === activeSignOrder.id ? {
        ...o,
        signature_data: dataUrl,
        status: 'completed'
      } : o));
    } catch (e) {
      console.error(e);
    }

    setActiveSignOrder(null);
  };

  // ──── Photos Upload Logic ────
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePhotoOrder || !photoUrlInput.trim()) return;

    const currentPhotos = activePhotoOrder.execution_photos || [];
    const newPhotos = [...currentPhotos, photoUrlInput.trim()];

    const updatedNotes = JSON.stringify({
      tech: activePhotoOrder.technician_name,
      products: activePhotoOrder.products_list,
      dimensions: activePhotoOrder.dimensions || [],
      total_price: activePhotoOrder.total_price || 0,
      deposit: activePhotoOrder.deposit || 0,
      collection_amount: activePhotoOrder.collection_amount || 0,
      photos: newPhotos,
      signature: activePhotoOrder.signature_data
    });

    try {
      await supabase.from('appointments').update({ notes: updatedNotes }).eq('id', activePhotoOrder.id);
      setOrders(prev => prev.map(o => o.id === activePhotoOrder.id ? {
        ...o,
        execution_photos: newPhotos
      } : o));
    } catch (e) {
      console.error(e);
    }

    setPhotoUrlInput('');
    setActivePhotoOrder(null);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch =
        o.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.client_phone?.includes(searchQuery) ||
        o.technician_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFDFA] p-6 rounded-2xl border border-[#3E2723]/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#3E2723]">أوامر التركيب والمقاسات والتحصيل</h2>
          <p className="text-xs text-[#3E2723]/60 mt-1">
            إدارة جداول التركيب، مواصفات ومقاسات الستائر، وفلوس التحصيل المطلوبة وتواقيع التسليم
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {userRole === 'admin' && (
            <button
              onClick={() => setShowTechManagerModal(true)}
              className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#d4af37] text-[#3E2723] hover:bg-[#d4af37] hover:text-[#2B1B17] px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-base text-[#d4af37]">manage_accounts</span>
              <span>إدارة الفنيين</span>
            </button>
          )}

          <button
            onClick={handleOpenAddOrder}
            className="flex items-center gap-1.5 bg-[#d4af37] text-[#2B1B17] hover:bg-[#b8922a] px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>+ إنشاء أمر تركيب</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#3E2723]/40 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="بحث باسم العميل، الهاتف، الفني..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 border border-[#3E2723]/15 rounded-xl bg-white text-xs outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-[#3E2723] text-white'
                  : 'bg-white border border-[#3E2723]/10 text-[#3E2723]/70 hover:bg-[#3E2723]/5'
              }`}
            >
              {st === 'all' ? 'الكل' : st === 'pending' ? 'قيد الانتظار' : st === 'confirmed' ? 'مؤكد' : st === 'completed' ? 'مكتمل' : 'ملغي'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-[#3E2723]/40">جاري تحميل أوامر التركيب...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-[#3E2723]/20">
            <span className="material-symbols-outlined text-3xl text-[#3E2723]/30 mb-1">build</span>
            <p className="text-xs text-[#3E2723]/60 font-bold">لا توجد أوامر تركيب مطابقة للبحث</p>
          </div>
        ) : filteredOrders.map(order => {
          const tot = Number(order.total_price || 0);
          const dep = Number(order.deposit || 0);
          const coll = order.collection_amount !== undefined ? Number(order.collection_amount) : Math.max(0, tot - dep);

          return (
            <div
              key={order.id}
              className="bg-white border border-[#3E2723]/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 relative"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#3E2723]/5 pb-2 mb-2">
                  <span className="text-[10px] font-extrabold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-md">
                    #{order.id.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditOrder(order)}
                      className="text-[#3E2723]/50 hover:text-[#d4af37] p-1"
                      title="تعديل أمر التركيب والمقاسات"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="حذف الأمر"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status === 'completed' ? 'مكتمل' : order.status === 'confirmed' ? 'مؤكد' : 'قيد الانتظار'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-[#3E2723]/80">
                  <div><b>العميل:</b> {order.client_name}</div>
                  <div><b>الهاتف:</b> <span className="select-all">{order.client_phone}</span></div>
                  <div><b>العنوان:</b> {order.client_address || '—'}</div>
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
                  
                  {/* فلوس التحصيل Highlight Badge */}
                  <div className="mt-2 bg-amber-50/80 border border-amber-300/60 rounded-xl p-2.5 flex items-center justify-between text-amber-950">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-amber-800">فلوس التحصيل المطلوبة:</span>
                      <span className="text-xs text-amber-900/70 font-medium">
                        إجمالي: {tot > 0 ? tot.toLocaleString('ar-EG') : '—'} ج.م | عربون: {dep > 0 ? dep.toLocaleString('ar-EG') : '—'} ج.م
                      </span>
                    </div>
                    <span className="text-sm font-black text-amber-900 bg-amber-200/60 px-2 py-1 rounded-lg">
                      {coll > 0 ? `${coll.toLocaleString('ar-EG')} ج.م` : 'خالص'}
                    </span>
                  </div>

                  {/* جدول المقاسات / المنتجات Summary */}
                  {order.dimensions && order.dimensions.length > 0 ? (
                    <div className="mt-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#3E2723]/10">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-bold text-[#3E2723]/70">جدول المقاسات ({order.dimensions.length} ستائر):</span>
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {order.dimensions.map((d, idx) => (
                          <div key={idx} className="text-[11px] flex justify-between items-center border-b border-[#3E2723]/5 pb-0.5">
                            <span className="font-bold text-[#3E2723]">{d.type}</span>
                            <span className="text-[#3E2723]/60 font-mono text-[10px]" dir="ltr">
                              {d.width}m × {d.height}m ({d.notes || '—'})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : order.products_list && order.products_list.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[10px] font-bold text-[#3E2723]/50 block mb-1">المنتجات المطلوب تركيبها:</span>
                      <ul className="list-disc list-inside bg-[#FAF8F5] p-2 rounded-lg border border-[#3E2723]/5">
                        {order.products_list?.map((p, idx) => (
                          <li key={idx} className="font-semibold text-[#3E2723]/90">{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Uploaded Photos */}
                  {order.execution_photos && order.execution_photos.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[10px] font-bold text-[#3E2723]/50 block mb-1">صور التنفيذ الفني:</span>
                      <div className="flex gap-2">
                        {order.execution_photos.map((img, i) => (
                          <div key={i} className="w-12 h-12 rounded-lg border border-[#3E2723]/10 overflow-hidden bg-gray-50">
                            <img src={img} alt="Execution" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Signature display */}
                  {order.signature_data && (
                    <div className="mt-2 bg-green-50/50 p-2 rounded-lg border border-green-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-green-600 text-base">verified</span>
                        <span className="text-[10px] text-green-800 font-bold">تم توقيع العميل</span>
                      </div>
                      <img src={order.signature_data} alt="signature" className="h-5 object-contain filter grayscale" />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-[#3E2723]/5 pt-3 mt-2 flex-wrap gap-2">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handlePrint(order)}
                    className="flex items-center gap-1 bg-white border border-[#3E2723]/15 text-[#3E2723] hover:border-[#d4af37] px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">print</span>
                    <span>طباعة أمر التركيب</span>
                  </button>
                  
                  {!order.signature_data && (
                    <button
                      onClick={() => openSignModal(order)}
                      className="flex items-center gap-1 bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#b8922a] hover:bg-[#d4af37]/20 px-2.5 py-1.5 rounded-xl text-[10px] font-bold"
                    >
                      <span className="material-symbols-outlined text-sm">draw</span>
                      <span>توقيع واستلام</span>
                    </button>
                  )}
                </div>

                {userRole === 'admin' && (
                  <select
                    value={order.status}
                    onChange={e => handleUpdateStatus(order.id, e.target.value as any)}
                    className="border border-[#3E2723]/25 rounded-lg px-2 py-1 bg-[#FAF8F5] text-[10px] font-bold outline-none cursor-pointer"
                  >
                    <option value="pending">🟡 قيد الانتظار</option>
                    <option value="confirmed">🔵 مؤكد</option>
                    <option value="completed">🟢 مكتمل</option>
                    <option value="cancelled">🔴 ملغي</option>
                  </select>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Signature Capture Modal */}
      {activeSignOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[2000]">
          <div className="bg-white rounded-2xl border border-[#3E2723]/15 w-full max-w-sm shadow-2xl overflow-hidden text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#3E2723] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-xs">توقيع العميل بالاستلام</h3>
              <button onClick={() => setActiveSignOrder(null)} className="text-white/60">✕</button>
            </div>
            
            <div className="p-4 flex flex-col gap-4">
              <p className="text-[11px] text-[#3E2723]/60">يرجى من العميل التوقيع داخل الإطار لتأكيد اكتمال التركيب والرضا عن الخدمة:</p>
              
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
                  مسح التوقيع
                </button>
                <button
                  type="button" onClick={saveSignature}
                  className="px-4 py-1.5 bg-[#d4af37] text-[#2B1B17] rounded-lg text-[10px] font-bold hover:bg-[#b8922a]"
                >
                  اعتماد التوقيع
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Technicians Manager */}
      {showTechManagerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDFA] border border-white/60 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
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

            {/* Add new Tech */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTechName}
                onChange={e => setNewTechName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTechnician(); } }}
                placeholder="اسم الفني الجديد..."
                className="flex-1 px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
              />
              <button
                type="button"
                disabled={techSaving || !newTechName.trim()}
                onClick={handleAddTechnician}
                className="px-4 py-2 bg-[#d4af37] text-[#2B1B17] font-bold text-xs rounded-xl hover:bg-[#b8922a] disabled:opacity-50 transition-colors"
              >
                {techSaving ? '...' : '+ إضافة'}
              </button>
            </div>

            {/* Tech list */}
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {technicians.length === 0 ? (
                <p className="text-xs text-[#3E2723]/40 text-center py-4">لا يوجد فنيين مسجلين</p>
              ) : (
                technicians.map(t => (
                  <div
                    key={t.id || t.name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#3E2723]/10 hover:border-[#d4af37]/40 transition-colors"
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

      {/* Modal: Create or Edit Installation Order with Dimensions & Financial Collection */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDFA] border border-white/60 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#3E2723]/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d4af37]">build_circle</span>
                <h3 className="font-bold text-[#3E2723] text-sm">
                  {editingOrder ? 'تعديل أمر التركيب والمقاسات' : 'إنشاء أمر تركيب ومقاسات جديد'}
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

            <form onSubmit={handleSaveOrder} className="flex flex-col gap-4">
              
              {/* Client Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">اسم العميل *</label>
                  <input
                    type="text"
                    required
                    value={orderFormData.client_name}
                    onChange={e => setOrderFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                    placeholder="مثال: أحمد محمود"
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
                <label className="text-[10px] font-bold text-[#3E2723]/70">عنوان التركيب بالتفصيل</label>
                <input
                  type="text"
                  value={orderFormData.client_address}
                  onChange={e => setOrderFormData(prev => ({ ...prev, client_address: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                  placeholder="مثال: التجمع الخامس، الحي الأول، عمارة 42"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">تاريخ التركيب</label>
                  <input
                    type="date"
                    value={orderFormData.appointment_date}
                    onChange={e => setOrderFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">الوقت</label>
                  <input
                    type="time"
                    value={orderFormData.appointment_time}
                    onChange={e => setOrderFormData(prev => ({ ...prev, appointment_time: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">الفني المسئول</label>
                  <select
                    value={orderFormData.technician_name}
                    onChange={e => setOrderFormData(prev => ({ ...prev, technician_name: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
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
                    className="w-full px-2.5 py-1.5 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none focus:border-[#d4af37]"
                  >
                    <option value="pending">🟡 قيد الانتظار</option>
                    <option value="confirmed">🔵 مؤكد</option>
                    <option value="completed">🟢 مكتمل</option>
                    <option value="cancelled">🔴 ملغي</option>
                  </select>
                </div>
              </div>

              {/* Financial Collection Section (فلوس التحصيل) */}
              <div className="bg-amber-50/70 border border-amber-300/80 rounded-xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                  <span className="material-symbols-outlined text-base text-amber-600">payments</span>
                  <span>بيانات الحسابات والتحصيل (فلوس التحصيل)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-amber-900">إجمالي القيمة (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      value={orderFormData.total_price || ''}
                      onChange={e => handlePriceChange('total_price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-1.5 border border-amber-300 rounded-lg text-xs font-bold outline-none bg-white focus:border-amber-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-amber-900">العربون المسدد (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      value={orderFormData.deposit || ''}
                      onChange={e => handlePriceChange('deposit', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-1.5 border border-amber-300 rounded-lg text-xs font-bold outline-none bg-white focus:border-amber-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-amber-950">المطلوب تحصيله (فلوس التحصيل ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      value={orderFormData.collection_amount !== undefined ? orderFormData.collection_amount : ''}
                      onChange={e => handlePriceChange('collection_amount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-1.5 border-2 border-amber-500 bg-amber-100/70 rounded-lg text-xs font-black text-amber-950 outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* Dimensions Table Section (جدول المقاسات) */}
              <div className="border border-[#3E2723]/15 rounded-xl p-3.5 bg-white flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#d4af37]">straighten</span>
                    <span className="text-xs font-bold text-[#3E2723]">جدول المقاسات والمواصفات المطلوب تركيبها</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDimensionRow}
                    className="text-[10px] font-bold text-[#d4af37] hover:text-[#b8922a] border border-[#d4af37]/30 bg-[#d4af37]/10 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    + إضافة مقاس ستارة
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF8F5] text-[#3E2723]/70 border-b border-[#3E2723]/10">
                        <th className="p-1.5 font-bold">نوع الستارة</th>
                        <th className="p-1.5 font-bold w-20">العرض (م)</th>
                        <th className="p-1.5 font-bold w-20">الارتفاع (م)</th>
                        <th className="p-1.5 font-bold w-20">المساحة</th>
                        <th className="p-1.5 font-bold">المكان والملاحظات</th>
                        <th className="p-1.5 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dimensionsList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-4 text-xs text-[#3E2723]/40">
                            لا توجد مقاسات مسجلة. اضغط على "+ إضافة مقاس ستارة" لإضافة بنود المقاسات
                          </td>
                        </tr>
                      ) : (
                        dimensionsList.map((dim, idx) => {
                          const area = ((Number(dim.width) || 0) * (Number(dim.height) || 0)).toFixed(2);
                          return (
                            <tr key={idx} className="border-b border-[#3E2723]/5">
                              <td className="p-1">
                                <input
                                  type="text"
                                  value={dim.type}
                                  onChange={e => handleDimensionChange(idx, 'type', e.target.value)}
                                  placeholder="مثال: ستائر زيبرا"
                                  className="w-full px-2 py-1 border border-[#3E2723]/15 rounded-lg text-xs outline-none bg-[#FAF8F5] focus:border-[#d4af37]"
                                />
                              </td>
                              <td className="p-1">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={dim.width || ''}
                                  onChange={e => handleDimensionChange(idx, 'width', parseFloat(e.target.value) || 0)}
                                  placeholder="1.5"
                                  className="w-full px-1.5 py-1 border border-[#3E2723]/15 rounded-lg text-xs outline-none bg-[#FAF8F5] focus:border-[#d4af37] text-center font-mono"
                                />
                              </td>
                              <td className="p-1">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={dim.height || ''}
                                  onChange={e => handleDimensionChange(idx, 'height', parseFloat(e.target.value) || 0)}
                                  placeholder="2.0"
                                  className="w-full px-1.5 py-1 border border-[#3E2723]/15 rounded-lg text-xs outline-none bg-[#FAF8F5] focus:border-[#d4af37] text-center font-mono"
                                />
                              </td>
                              <td className="p-1 text-center font-mono font-bold text-[11px] text-[#3E2723]">
                                {area} م²
                              </td>
                              <td className="p-1">
                                <input
                                  type="text"
                                  value={dim.notes || ''}
                                  onChange={e => handleDimensionChange(idx, 'notes', e.target.value)}
                                  placeholder="غرفة نوم / ريسبشن"
                                  className="w-full px-2 py-1 border border-[#3E2723]/15 rounded-lg text-xs outline-none bg-[#FAF8F5] focus:border-[#d4af37]"
                                />
                              </td>
                              <td className="p-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDimensionRow(idx)}
                                  className="text-red-400 hover:text-red-600 p-1"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-2.5 mt-2 justify-end">
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
                  className="px-6 py-2 bg-[#d4af37] text-[#2B1B17] font-bold rounded-xl text-xs hover:bg-[#b8922a] disabled:opacity-50 shadow-sm"
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
