'use client';

import { useState, useMemo } from 'react';
import { Appointment, Bill, AppointmentType } from '@/lib/supabase';
import { Product } from '@/lib/products';
import { ContactMessage } from '@/lib/messages';

interface AdvancedDashboardViewProps {
  appointments: Appointment[];
  orders: any[];
  bills: Bill[];
  expenses: any[];
  products: Product[];
  messages: ContactMessage[];
  employees?: any[];
  unreadCount: number;
  userRole: string | null;
  userProfile: { name: string; email: string } | null;
  setActiveTab: (tab: any) => void;
  openNewBillModal: () => void;
  setShowAddModal: (show: boolean) => void;
  setShowProductModal: (show: boolean) => void;
  setShowPartnerModal: (show: boolean) => void;
  setShowUserModal: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  handleSignOut: () => void;
}

export default function AdvancedDashboardView({
  appointments,
  orders,
  bills,
  expenses,
  products,
  messages,
  employees = [],
  unreadCount,
  userRole,
  userProfile,
  setActiveTab,
  openNewBillModal,
  setShowAddModal,
  setShowProductModal,
  setShowPartnerModal,
  setShowUserModal,
  setShowSettings,
  handleSignOut,
}: AdvancedDashboardViewProps) {
  // 1. Current Date formatting
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const today = new Date().toISOString().split('T')[0];

  // 2. Metric calculations
  const todayAppts = useMemo(() => appointments.filter(a => a.appointment_date === today), [appointments, today]);
  const pendingBills = useMemo(() => bills.filter(b => Number(b.remaining_amount) > 0), [bills]);
  const activeOrders = useMemo(() => orders.filter(o => o.status === 'pending' || o.status === 'shipped'), [orders]);

  const uniqueClientsCount = useMemo(() => {
    const names = new Set<string>();
    appointments.forEach(a => { if (a.client_name?.trim()) names.add(a.client_name.trim().toLowerCase()); });
    orders.forEach(o => { if (o.client_name?.trim()) names.add(o.client_name.trim().toLowerCase()); });
    bills.forEach(b => { if (b.client_name?.trim()) names.add(b.client_name.trim().toLowerCase()); });
    return names.size;
  }, [appointments, orders, bills]);

  const openWorkOrdersCount = useMemo(() => {
    return appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
  }, [appointments]);

  const completionRate = useMemo(() => {
    const total = appointments.length;
    if (total === 0) return 0;
    const completed = appointments.filter(a => a.status === 'completed').length;
    return Math.round((completed / total) * 100);
  }, [appointments]);

  const totalRevenue = useMemo(() => {
    const totalBills = bills.reduce((sum, b) => sum + (Number(b.final_total) || 0), 0);
    return Math.round(totalBills);
  }, [bills]);

  const currentMonthRevenue = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    return bills.reduce((sum, b) => {
      const d = new Date(b.created_at || b.updated_at);
      if (d.getMonth() === m && d.getFullYear() === y) {
        return sum + (Number(b.final_total) || 0);
      }
      return sum;
    }, 0);
  }, [bills]);

  const lastMonthRevenue = useMemo(() => {
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return bills.reduce((sum, b) => {
      const d = new Date(b.created_at || b.updated_at);
      if (d.getMonth() === lastMonth && d.getFullYear() === lastYear) {
        return sum + (Number(b.final_total) || 0);
      }
      return sum;
    }, 0);
  }, [bills]);

  const revenueGrowthText = useMemo(() => {
    if (lastMonthRevenue === 0) {
      return currentMonthRevenue > 0 ? 'إيرادات هذا الشهر' : 'لا توجد فواتير هذا الشهر';
    }
    const diff = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    const sign = diff >= 0 ? '+' : '';
    return `${sign}${Math.round(diff)}% عن الشهر الماضي`;
  }, [currentMonthRevenue, lastMonthRevenue]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const netProfit = totalRevenue - totalExpenses;

  // 3. Task checklist local state
  const defaultTasks = useMemo(() => {
    return todayAppts.map(a => ({
      id: a.id,
      time: a.appointment_time?.slice(0, 5) || '—',
      text: `${a.appointment_type === 'inspection' ? 'معاينة' : a.appointment_type === 'installation' ? 'تركيب' : 'صيانة'} للعميل ${a.client_name}${a.client_address ? ` - ${a.client_address}` : ''}`,
    }));
  }, [todayAppts]);

  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (id: string) => {
    setCheckedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 4. Alert log details
  const alerts = useMemo(() => {
    const list = [];
    if (todayAppts.length > 0) {
      list.push({ text: `لديك ${todayAppts.length} مواعيد مجدولة اليوم.`, time: 'اليوم', icon: 'calendar_today', color: '#b8922a' });
    }

    if (pendingBills.length > 0) {
      const remainingTotal = pendingBills.reduce((sum, b) => sum + (Number(b.remaining_amount) || 0), 0);
      list.push({ text: `لديك ${pendingBills.length} فاتورة بها متبقي (${Math.round(remainingTotal).toLocaleString('ar-EG')} ج.م).`, time: 'تنبيه دفع', icon: 'payments', color: '#8D6E63' });
    }

    if (activeOrders.length > 0) {
      list.push({ text: `لديك ${activeOrders.length} طلب شراء موقع نشط.`, time: 'الطلبات', icon: 'shopping_cart', color: '#d4af37' });
    }

    if (unreadCount > 0) {
      list.push({ text: `لديك ${unreadCount} رسائل تواصل جديدة غير مقروءة.`, time: 'الرسائل', icon: 'mail', color: '#ef4444' });
    }

    return list;
  }, [todayAppts, pendingBills, activeOrders, unreadCount]);

  // 5. Service Performance Donut segmented percentages
  const donutPercentage = useMemo(() => {
    const totalApptsCount = appointments.length;
    if (totalApptsCount === 0) return { inspect: 0, install: 0, maint: 0, total: 0, inspectCount: 0, installCount: 0, maintCount: 0 };
    const inspectCount = appointments.filter(a => a.appointment_type === 'inspection').length;
    const installCount = appointments.filter(a => a.appointment_type === 'installation').length;
    const maintCount = appointments.filter(a => a.appointment_type === 'maintenance').length;
    
    const inspectPct = Math.round((inspectCount / totalApptsCount) * 100);
    const installPct = Math.round((installCount / totalApptsCount) * 100);
    const maintPct = Math.round((maintCount / totalApptsCount) * 100);

    return {
      inspect: inspectPct,
      install: installPct,
      maint: maintPct,
      total: totalApptsCount,
      inspectCount,
      installCount,
      maintCount,
    };
  }, [appointments]);

  // Donut chart segments calculations
  const donutSegments = useMemo(() => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const values = [donutPercentage.inspect, donutPercentage.install, donutPercentage.maint];
    let currentOffset = 0;

    return values.map((val) => {
      const strokeDashoffset = circumference - (val / 100) * circumference;
      const rotation = (currentOffset / 100) * 360;
      currentOffset += val;
      return { strokeDashoffset, strokeDasharray: circumference, rotation };
    });
  }, [donutPercentage]);

  // 6. Top Products rendering
  const displayProducts = useMemo(() => {
    return products.slice(0, 5).map((p, index) => ({
      name: p.labelAr || 'منتج ستائر',
      sales: `نشط`,
      pct: 100 - index * 15,
      img: p.images?.[0] || '/placeholder.png',
    }));
  }, [products]);

  // 7. Upcoming appointments table list
  const upcomingTableList = useMemo(() => {
    return appointments
      .filter(a => a.status === 'confirmed' || a.status === 'pending')
      .slice(0, 5)
      .map(a => ({
        id: a.id,
        time: a.appointment_time?.slice(0, 5) || '—',
        client: a.client_name,
        location: a.client_address || '—',
        status: a.status,
      }));
  }, [appointments]);

  // 8. Monthly sales chart data points based on invoice dates
  const monthlySalesPoints = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const sums = [0, 0, 0, 0, 0, 0];
    bills.forEach(b => {
      const bDate = new Date(b.created_at || b.updated_at);
      if (bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear) {
        const day = bDate.getDate();
        if (day <= 5) sums[0] += Number(b.final_total) || 0;
        else if (day <= 10) sums[1] += Number(b.final_total) || 0;
        else if (day <= 15) sums[2] += Number(b.final_total) || 0;
        else if (day <= 20) sums[3] += Number(b.final_total) || 0;
        else if (day <= 25) sums[4] += Number(b.final_total) || 0;
        else sums[5] += Number(b.final_total) || 0;
      }
    });

    const maxVal = Math.max(...sums, 1000);
    return sums.map((val, idx) => {
      const x = idx * 20;
      const y = 35 - (val / maxVal) * 28;
      return { x, y, val };
    });
  }, [bills]);

  const monthlySalesPathData = useMemo(() => {
    if (monthlySalesPoints.length === 0) return { pathD: '', areaD: '' };
    
    let pathD = '';
    monthlySalesPoints.forEach((pt, idx) => {
      if (idx === 0) pathD = `M ${pt.x},${pt.y}`;
      else pathD += ` L ${pt.x},${pt.y}`;
    });

    const areaD = pathD ? `${pathD} L 100,40 L 0,40 Z` : '';
    return { pathD, areaD };
  }, [monthlySalesPoints]);

  // 9. Weekly Revenue vs Expenses
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const weeks = [
      { rev: 0, exp: 0 },
      { rev: 0, exp: 0 },
      { rev: 0, exp: 0 },
      { rev: 0, exp: 0 },
    ];

    bills.forEach(b => {
      const bDate = new Date(b.created_at || b.updated_at);
      if (bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear) {
        const day = bDate.getDate();
        const amt = Number(b.final_total) || 0;
        if (day <= 7) weeks[0].rev += amt;
        else if (day <= 14) weeks[1].rev += amt;
        else if (day <= 21) weeks[2].rev += amt;
        else weeks[3].rev += amt;
      }
    });

    expenses.forEach(e => {
      const eDate = new Date(e.created_at || e.expense_date);
      if (eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear) {
        const day = eDate.getDate();
        const amt = Number(e.amount) || 0;
        if (day <= 7) weeks[0].exp += amt;
        else if (day <= 14) weeks[1].exp += amt;
        else if (day <= 21) weeks[2].exp += amt;
        else weeks[3].exp += amt;
      }
    });

    const maxVal = Math.max(...weeks.map(w => Math.max(w.rev, w.exp)), 1000);

    return weeks.map(w => {
      const revPct = maxVal > 0 ? (w.rev / maxVal) * 90 : 0;
      const expPct = maxVal > 0 ? (w.exp / maxVal) * 90 : 0;
      return {
        rev: w.rev,
        exp: w.exp,
        revHeight: `${Math.max(5, revPct)}%`,
        expHeight: `${Math.max(5, expPct)}%`,
      };
    });
  }, [bills, expenses]);

  // 10. Real Employee performance grouping
  const employeeStats = useMemo(() => {
    if (!employees || employees.length === 0) {
      return [];
    }

    const list = employees.map(emp => {
      const empName = (emp.name || '').trim().toLowerCase();
      if (!empName) return null;

      const taskCount = appointments.filter(a => {
        if (!a.notes) return false;
        try {
          const parsed = JSON.parse(a.notes);
          if (parsed && parsed.tech && String(parsed.tech).trim().toLowerCase() === empName) {
            return true;
          }
        } catch {}
        return a.notes.toLowerCase().includes(empName);
      }).length;

      return {
        name: emp.name,
        tasks: taskCount,
      };
    }).filter(Boolean) as { name: string; tasks: number }[];

    if (list.length === 0) return [];

    list.sort((a, b) => b.tasks - a.tasks);
    const maxTasks = Math.max(...list.map(l => l.tasks), 1);
    const colors = ['#d4af37', '#3E2723', '#8D6E63', '#2E7D32', '#EF5350'];

    return list.map((item, idx) => ({
      name: item.name,
      tasks: item.tasks,
      color: colors[idx % colors.length],
      pct: maxTasks > 0 && item.tasks > 0 ? Math.round((item.tasks / maxTasks) * 100) : 0,
    }));
  }, [appointments, employees]);

  return (
    <div className="flex flex-col gap-6 text-[#3E2723]" style={{ direction: 'rtl' }}>
      
      {/* ─── TOP HEADER BAR ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        
        {/* User Card info (Left) */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3E2723]/5 flex items-center justify-center text-[#3E2723]/70 border border-[#3E2723]/10 shrink-0">
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <div className="flex flex-col text-right items-start">
            <span className="font-bold text-sm text-[#3E2723]">{userProfile?.name || 'أحمد المدير'}</span>
            <span className="text-[10px] text-[#3E2723]/50 font-semibold">
              {userRole === 'admin' ? 'المدير العام' : 
               userRole === 'customer_service' ? 'خدمة عملاء' :
               userRole === 'sales' ? 'المبيعات' :
               userRole === 'accountant' ? 'المحاسب المالي' :
               userRole === 'technician' ? 'فني تركيبات' : 'موظف'}
            </span>
          </div>
          <div className="relative mr-2 cursor-pointer hover:opacity-85 shrink-0" onClick={() => setActiveTab('messages')}>
            <span className="material-symbols-outlined text-[#3E2723]/70 text-xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#b91c1c] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 mr-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 text-xs font-bold transition-all duration-200 shrink-0"
            title="تسجيل الخروج"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>

        {/* Date and Navigation (Right) */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right items-start">
            <span className="text-xs font-bold text-[#d4af37]">{formattedDate}</span>
            <span className="text-[10px] text-[#3E2723]/40 font-semibold">{`نظام إدارة كريستال للستائر`}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] shrink-0">
            <span className="material-symbols-outlined text-lg">calendar_today</span>
          </div>
        </div>
      </div>

      {/* ─── TITLE BANNER ─── */}
      <div className="flex items-center justify-between bg-gradient-to-l from-[#3E2723] to-[#2B1B17] text-white p-6 rounded-2xl border border-white/5 shadow-md">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-headline mb-1.5">لوحة التحكم الرئيسية</h1>
          <p className="text-xs md:text-sm text-white/70 font-light">مرحباً بك في نظام إدارة ومبيعات كريستال للستائر</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10">
          <span className="material-symbols-outlined text-2xl">home</span>
        </div>
      </div>

      {/* ─── PRIMARY WIDGETS STATS (6 Cards Row matching client edits) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        
        {/* Metric 1: Notifications Center */}
        <div 
          onClick={() => setActiveTab('messages')}
          className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-[#d4af37]/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3E2723]/60">🔔 مركز الإشعارات</span>
            <span className="w-8 h-8 rounded-full bg-[#ef4444]/10 text-[#ef4444] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg animate-pulse">notifications_active</span>
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold text-[#ef4444]">{unreadCount} تنبيه</h2>
            <p className="text-[10px] text-[#3E2723]/50 mt-1 font-semibold">تحتاج إجراء عاجل</p>
          </div>
        </div>

        {/* Metric 2: Today's Appointments */}
        <div 
          onClick={() => setActiveTab('appointments')}
          className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-[#d4af37]/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3E2723]/60">📅 مواعيد اليوم</span>
            <span className="w-8 h-8 rounded-full bg-[#d4af37]/15 text-[#b8922a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">calendar_today</span>
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold text-[#3E2723]">{todayAppts.length} موعد</h2>
            <p className="text-[10px] text-[#2E7D32] mt-1 font-semibold">تحديث مستمر</p>
          </div>
        </div>

        {/* Metric 3: Monthly Revenues */}
        <div 
          onClick={() => setActiveTab('bills')}
          className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-[#d4af37]/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3E2723]/60">💰 إيرادات الشهر</span>
            <span className="w-8 h-8 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">payments</span>
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold text-[#3E2723]">{currentMonthRevenue.toLocaleString('ar-EG')} ج.م</h2>
            <p className="text-[10px] text-[#2E7D32] mt-1 font-semibold">{revenueGrowthText}</p>
          </div>
        </div>

        {/* Metric 4: Open Work Orders */}
        <div 
          className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3E2723]/60">📦 أوامر التشغيل المفتوحة</span>
            <span className="w-8 h-8 rounded-full bg-[#8D6E63]/10 text-[#8D6E63] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">construction</span>
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold text-[#3E2723]">{openWorkOrdersCount} أمر تشغيل</h2>
            <p className="text-[10px] text-[#3E2723]/50 mt-1 font-semibold">قيد المتابعة الفنية</p>
          </div>
        </div>

        {/* Metric 5: New Clients */}
        <div 
          onClick={() => setActiveTab('clients')}
          className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-[#d4af37]/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3E2723]/60">👥 العملاء</span>
            <span className="w-8 h-8 rounded-full bg-[#3E2723]/10 text-[#3E2723] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">group</span>
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold text-[#3E2723]">{uniqueClientsCount} عميل</h2>
            <p className="text-[10px] text-[#2E7D32] mt-1 font-semibold">إجمالي العملاء المسجلين</p>
          </div>
        </div>

        {/* Metric 6: Completion Rate */}
        <div 
          className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3E2723]/60">📈 نسبة الإنجاز</span>
            <span className="w-8 h-8 rounded-full bg-[#00695C]/10 text-[#00695C] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">trending_up</span>
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold text-[#d4af37]">{completionRate}%</h2>
            <p className="text-[10px] text-[#2E7D32] mt-1 font-semibold">
              {completionRate > 75 ? 'ممتاز ومستقر' : completionRate > 40 ? 'جيد' : completionRate > 0 ? 'قيد الإنجاز' : 'لا توجد مهام مكتملة بعد'}
            </p>
          </div>
        </div>

      </div>

      {/* ─── CHARTS SECTION (Grid of 4) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Card 1: Monthly Sales Line Chart */}
        <div className="bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-[#3E2723]">المبيعات الشهرية</h3>
            <span className="text-xs font-semibold text-[#d4af37]">هذا الشهر</span>
          </div>
          
          <div className="relative h-44 w-full flex items-center justify-center">
            {/* SVG Line Chart */}
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="#3E2723" strokeOpacity="0.05" strokeWidth="0.25" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="#3E2723" strokeOpacity="0.05" strokeWidth="0.25" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="#3E2723" strokeOpacity="0.05" strokeWidth="0.25" />
              
              {/* Gradient Area */}
              {monthlySalesPathData.areaD && <path d={monthlySalesPathData.areaD} fill="url(#areaGrad)" />}
              {/* Line path */}
              {monthlySalesPathData.pathD && <path d={monthlySalesPathData.pathD} fill="none" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" />}
              
              {/* Circle dots */}
              {monthlySalesPoints.map((pt, idx) => (
                <circle 
                  key={idx}
                  cx={pt.x} 
                  cy={pt.y} 
                  r="1.2" 
                  fill="#3E2723" 
                  stroke="#d4af37" 
                  strokeWidth="0.5" 
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </svg>
            
            {/* Custom overlay tooltip exactly matching the layout */}
            <div className="absolute top-[3%] right-[10%] bg-[#3E2723] text-white text-[10px] font-bold px-2 py-1 rounded shadow-md border border-[#d4af37]/30">
              {currentMonthRevenue.toLocaleString('ar-EG')} ج.م
            </div>
          </div>
          
          <div className="flex justify-between text-[9px] text-[#3E2723]/50 mt-2">
            <span>01</span>
            <span>05</span>
            <span>10</span>
            <span>15</span>
            <span>20</span>
            <span>25</span>
            <span>30</span>
          </div>
        </div>

        {/* Card 2: Service Performance Donut */}
        <div className="bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-[#3E2723]">أداء الخدمات</h3>
            <span className="material-symbols-outlined text-[#3E2723]/50 text-lg cursor-pointer">info</span>
          </div>

          <div className="flex items-center gap-4">
            
            {/* SVG Donut */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                {/* Background circle */}
                <circle 
                  cx="60" cy="60" r="50" 
                  fill="transparent" stroke="#E5E7EB" strokeWidth="12" 
                />
                {/* Segment 1: Inspection */}
                {donutPercentage.total > 0 && donutSegments[0] && (
                  <circle 
                    cx="60" cy="60" r="50" 
                    fill="transparent" stroke="#d4af37" strokeWidth="12" 
                    strokeDasharray={donutSegments[0].strokeDasharray} 
                    strokeDashoffset={donutSegments[0].strokeDashoffset} 
                    transform={`rotate(${donutSegments[0].rotation} 60 60)`}
                  />
                )}
                {/* Segment 2: Installation */}
                {donutPercentage.total > 0 && donutSegments[1] && (
                  <circle 
                    cx="60" cy="60" r="50" 
                    fill="transparent" stroke="#3E2723" strokeWidth="12" 
                    strokeDasharray={donutSegments[1].strokeDasharray} 
                    strokeDashoffset={donutSegments[1].strokeDashoffset} 
                    transform={`rotate(${donutSegments[1].rotation} 60 60)`}
                  />
                )}
                {/* Segment 3: Maintenance */}
                {donutPercentage.total > 0 && donutSegments[2] && (
                  <circle 
                    cx="60" cy="60" r="50" 
                    fill="transparent" stroke="#A1887F" strokeWidth="12" 
                    strokeDasharray={donutSegments[2].strokeDasharray} 
                    strokeDashoffset={donutSegments[2].strokeDashoffset} 
                    transform={`rotate(${donutSegments[2].rotation} 60 60)`}
                  />
                )}
              </svg>
              {/* Inner Circle content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-3 shadow-inner">
                <span className="text-[10px] text-[#3E2723]/50">الإجمالي</span>
                <span className="font-bold text-lg text-[#3E2723]">{appointments.length}</span>
              </div>
            </div>

            {/* Legend Labels list */}
            <div className="flex flex-col gap-2 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] block" />معاينات</span>
                <span className="font-bold text-[#3E2723]/60">{donutPercentage.inspect}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-[#3E2723] block" />تركيبات</span>
                <span className="font-bold text-[#3E2723]/60">{donutPercentage.install}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-[#A1887F] block" />صيانة</span>
                <span className="font-bold text-[#3E2723]/60">{donutPercentage.maint}%</span>
              </div>
            </div>

          </div>
        </div>

        {/* Card 3: Revenue vs Expenses Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-[#3E2723]">الإيرادات مقابل المصروفات</h3>
            <span className="text-xs font-semibold text-[#d4af37]">هذا الشهر</span>
          </div>

          <div className="h-32 w-full flex items-end justify-around relative pt-4">
            {/* Grid helper lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
              <div className="border-t border-[#3E2723] w-full" />
              <div className="border-t border-[#3E2723] w-full" />
              <div className="border-t border-[#3E2723] w-full" />
              <div className="border-t border-[#3E2723] w-full" />
            </div>

            {/* Week 1 */}
            <div className="flex items-end gap-1.5 h-full relative z-10">
              <div className="w-2.5 bg-[#d4af37] rounded-t-sm transition-all duration-300" style={{ height: weeklyStats[0].revHeight }} title={`إيرادات: ${weeklyStats[0].rev.toLocaleString()} ج.م`} />
              <div className="w-2.5 bg-[#3E2723] rounded-t-sm transition-all duration-300" style={{ height: weeklyStats[0].expHeight }} title={`مصروفات: ${weeklyStats[0].exp.toLocaleString()} ج.م`} />
            </div>
            {/* Week 2 */}
            <div className="flex items-end gap-1.5 h-full relative z-10">
              <div className="w-2.5 bg-[#d4af37] rounded-t-sm transition-all duration-300" style={{ height: weeklyStats[1].revHeight }} title={`إيرادات: ${weeklyStats[1].rev.toLocaleString()} ج.م`} />
              <div className="w-2.5 bg-[#3E2723] rounded-t-sm transition-all duration-300" style={{ height: weeklyStats[1].expHeight }} title={`مصروفات: ${weeklyStats[1].exp.toLocaleString()} ج.م`} />
            </div>
            {/* Week 3 */}
            <div className="flex items-end gap-1.5 h-full relative z-10">
              <div className="w-2.5 bg-[#d4af37] rounded-t-sm transition-all duration-300" style={{ height: weeklyStats[2].revHeight }} title={`إيرادات: ${weeklyStats[2].rev.toLocaleString()} ج.م`} />
              <div className="w-2.5 bg-[#3E2723] rounded-t-sm transition-all duration-300" style={{ height: weeklyStats[2].expHeight }} title={`مصروفات: ${weeklyStats[2].exp.toLocaleString()} ج.م`} />
            </div>
            {/* Week 4 */}
            <div className="flex items-end gap-1.5 h-full relative z-10">
              <div className="w-2.5 bg-[#d4af37] rounded-t-sm transition-all duration-300" style={{ height: weeklyStats[3].revHeight }} title={`إيرادات: ${weeklyStats[3].rev.toLocaleString()} ج.م`} />
              <div className="w-2.5 bg-[#3E2723] rounded-t-sm transition-all duration-300" style={{ height: weeklyStats[3].expHeight }} title={`مصروفات: ${weeklyStats[3].exp.toLocaleString()} ج.م`} />
            </div>
          </div>

          <div className="flex justify-around text-[9px] text-[#3E2723]/50 mt-3">
            <span>أسبوع 1</span>
            <span>أسبوع 2</span>
            <span>أسبوع 3</span>
            <span>أسبوع 4</span>
          </div>

          <div className="flex items-center justify-center gap-4 mt-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#d4af37]" /> إيرادات</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#3E2723]" /> مصروفات</span>
          </div>
        </div>

        {/* Card 4: Employee Performance Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-[#3E2723]">أداء الموظفين</h3>
            <span className="text-[10px] text-[#d4af37] font-semibold cursor-pointer hover:underline" onClick={() => setActiveTab('employees')}>إدارة الموظفين</span>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-[#3E2723]/50 block mb-1">حسب عدد المهام المنجزة الفنية</span>
            
            {employeeStats.length > 0 ? (
              employeeStats.map((emp, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#3E2723]">{emp.name}</span>
                    <span className="text-[#3E2723]/60 text-[10px] font-semibold">{emp.tasks} مهمة</span>
                  </div>
                  {/* Progress bar container */}
                  <div className="w-full h-1.5 bg-[#3E2723]/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${emp.pct}%`, backgroundColor: emp.color }} 
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-[#3E2723]/50 font-medium">
                لا توجد مهام مسندة لفنيين بعد
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ─── DETAILED INFORMATION TABLES & LISTS (3 Columns) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Col-span-5: Upcoming Appointments Table */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-sm text-[#3E2723]">المواعيد القادمة</h3>
              <button 
                type="button"
                className="text-[10px] border border-[#d4af37]/40 text-[#b8922a] bg-[#fdf8ec] px-3 py-1 rounded-full font-bold hover:bg-[#b8922a] hover:text-white transition-colors"
                onClick={() => setActiveTab('appointments')}
              >
                عرض جميع المواعيد
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#3E2723]/10 text-[#3E2723]/50">
                    <th className="pb-2 font-semibold text-right">الوقت</th>
                    <th className="pb-2 font-semibold text-right">العميل</th>
                    <th className="pb-2 font-semibold text-right">الموقع</th>
                    <th className="pb-2 font-semibold text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingTableList.length > 0 ? (
                    upcomingTableList.map(item => (
                      <tr key={item.id} className="border-b border-[#3E2723]/5 last:border-0 hover:bg-[#fdfbf7]/60 cursor-pointer" onClick={() => setActiveTab('appointments')}>
                        <td className="py-3 font-semibold text-[#3E2723]/80">{item.time}</td>
                        <td className="py-3 font-bold text-[#3E2723]">{item.client}</td>
                        <td className="py-3 text-[#3E2723]/60 truncate max-w-[120px]">{item.location}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            item.status === 'confirmed' ? 'bg-green-500/10 text-green-700' :
                            item.status === 'pending' ? 'bg-orange-500/10 text-orange-700' :
                            'bg-blue-500/10 text-blue-700'
                          }`}>
                            {item.status === 'confirmed' ? 'مؤكد' : item.status === 'pending' ? 'قيد التنفيذ' : 'جديد'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-xs text-[#3E2723]/50">
                        لا توجد مواعيد قادمة مسجلة حالياً
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Col-span-4: Today's Tasks Checklist */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-sm text-[#3E2723]">المهام اليوم</h3>
              <span className="material-symbols-outlined text-[#3E2723]/40">assignment_turned_in</span>
            </div>

            <div className="flex flex-col gap-3">
              {defaultTasks.length > 0 ? (
                defaultTasks.map(task => {
                  const isChecked = !!checkedTasks[task.id];
                  return (
                    <div 
                      key={task.id} 
                      onClick={() => toggleTask(task.id)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                        isChecked 
                          ? 'bg-[#3E2723]/5 border-[#3E2723]/10 opacity-60' 
                          : 'bg-white border-[#3E2723]/10 hover:border-[#d4af37]/50'
                      }`}
                    >
                      <button 
                        type="button"
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isChecked 
                            ? 'bg-[#3E2723] border-[#3E2723] text-white' 
                            : 'border-[#3E2723]/35 bg-white text-transparent'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed truncate font-medium ${isChecked ? 'line-through text-[#3E2723]/60' : 'text-[#3E2723]'}`}>
                          {task.text}
                        </p>
                        <span className="text-[10px] text-[#3E2723]/40 font-semibold">{task.time}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-[#3E2723]/50 font-medium">
                  لا توجد مواعيد مجدولة لهذا اليوم
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => setActiveTab('appointments')}
            className="w-full text-center py-2.5 mt-4 text-xs font-bold bg-[#fcf9f2] hover:bg-[#3E2723]/5 border border-[#3E2723]/10 rounded-xl transition-all"
          >
            عرض جميع المهام
          </button>
        </div>

        {/* Col-span-3: Recent Notifications / Warnings */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-sm text-[#3E2723]">التنبيهات</h3>
              <span className="material-symbols-outlined text-[#ef4444] text-xl animate-pulse">notifications_active</span>
            </div>

            <div className="flex flex-col gap-4">
              {alerts.length > 0 ? (
                alerts.map((alert, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${alert.color}12`, color: alert.color }}>
                      <span className="material-symbols-outlined text-base">{alert.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#3E2723] leading-relaxed break-words">
                        {alert.text}
                      </p>
                      <span className="text-[9px] text-[#3E2723]/40 font-semibold">{alert.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-[#3E2723]/50 font-medium">
                  لا توجد تنبيهات عاجلة حالياً
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('messages')}
            className="w-full text-center py-2.5 mt-4 text-xs font-bold bg-[#fcf9f2] hover:bg-[#3E2723]/5 border border-[#3E2723]/10 rounded-xl transition-all"
          >
            عرض جميع التنبيهات
          </button>
        </div>

      </div>

      {/* ─── QUICK ACTIONS (إجراءات سريعة) ─── */}
      <div>
        <h3 className="font-bold text-sm text-[#3E2723] mb-3">إجراءات سريعة</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 xl:grid-cols-9 gap-3">
          
          <button 
            onClick={() => { setShowUserModal(true); }}
            className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col items-center justify-center gap-2 hover:border-[#d4af37] shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all group"
          >
            <span className="w-10 h-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center group-hover:bg-[#d4af37] group-hover:text-white transition-all shrink-0">
              <span className="material-symbols-outlined">person_add</span>
            </span>
            <span className="text-[11px] font-bold text-[#3E2723]">إضافة عميل</span>
          </button>

          <button 
            onClick={() => { setShowAddModal(true); }}
            className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col items-center justify-center gap-2 hover:border-[#d4af37] shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all group"
          >
            <span className="w-10 h-10 rounded-xl bg-[#3E2723]/10 text-[#3E2723] flex items-center justify-center group-hover:bg-[#3E2723] group-hover:text-white transition-all shrink-0">
              <span className="material-symbols-outlined">calendar_today</span>
            </span>
            <span className="text-[11px] font-bold text-[#3E2723]">موعد جديد</span>
          </button>

          <button 
            onClick={openNewBillModal}
            className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col items-center justify-center gap-2 hover:border-[#d4af37] shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all group"
          >
            <span className="w-10 h-10 rounded-xl bg-[#8D6E63]/10 text-[#8D6E63] flex items-center justify-center group-hover:bg-[#8D6E63] group-hover:text-white transition-all shrink-0">
              <span className="material-symbols-outlined">description</span>
            </span>
            <span className="text-[11px] font-bold text-[#3E2723]">فاتورة جديدة</span>
          </button>

          <button 
            onClick={() => { setShowAddModal(true); }}
            className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col items-center justify-center gap-2 hover:border-[#d4af37] shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all group"
          >
            <span className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center group-hover:bg-[#2E7D32] group-hover:text-white transition-all shrink-0">
              <span className="material-symbols-outlined">search</span>
            </span>
            <span className="text-[11px] font-bold text-[#3E2723]">أمر معاينة</span>
          </button>

          <button 
            onClick={() => { setShowAddModal(true); }}
            className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col items-center justify-center gap-2 hover:border-[#d4af37] shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all group"
          >
            <span className="w-10 h-10 rounded-xl bg-[#D84315]/10 text-[#D84315] flex items-center justify-center group-hover:bg-[#D84315] group-hover:text-white transition-all shrink-0">
              <span className="material-symbols-outlined">construction</span>
            </span>
            <span className="text-[11px] font-bold text-[#3E2723]">أمر تركيب</span>
          </button>

          <button 
            onClick={() => { setShowAddModal(true); }}
            className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col items-center justify-center gap-2 hover:border-[#d4af37] shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all group"
          >
            <span className="w-10 h-10 rounded-xl bg-[#00695C]/10 text-[#00695C] flex items-center justify-center group-hover:bg-[#00695C] group-hover:text-white transition-all shrink-0">
              <span className="material-symbols-outlined">build</span>
            </span>
            <span className="text-[11px] font-bold text-[#3E2723]">أمر صيانة</span>
          </button>

          <button 
            onClick={openNewBillModal}
            className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col items-center justify-center gap-2 hover:border-[#d4af37] shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all group"
          >
            <span className="w-10 h-10 rounded-xl bg-[#C62828]/10 text-[#C62828] flex items-center justify-center group-hover:bg-[#C62828] group-hover:text-white transition-all shrink-0">
              <span className="material-symbols-outlined">payments</span>
            </span>
            <span className="text-[11px] font-bold text-[#3E2723]">مصروف جديد</span>
          </button>

          <button 
            onClick={() => setActiveTab('orders')}
            className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col items-center justify-center gap-2 hover:border-[#d4af37] shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all group"
          >
            <span className="w-10 h-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center group-hover:bg-[#d4af37] group-hover:text-white transition-all shrink-0">
              <span className="material-symbols-outlined">shopping_cart</span>
            </span>
            <span className="text-[11px] font-bold text-[#3E2723]">الطلبات</span>
          </button>
        </div>
      </div>

      {/* ─── FOOTER PERFORMANCE SUMMARY ─── */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-[#FAF7F2] p-5 rounded-2xl border border-[#3E2723]/10">
        
        <div className="flex flex-wrap items-center gap-8">
          
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-[#3E2723]/50">إجمالي الإيرادات</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-[#3E2723]">{totalRevenue.toLocaleString('ar-EG')} ج.م</span>
              <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">12% ↗</span>
            </div>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[10px] text-[#3E2723]/50">إجمالي المصروفات</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-[#3E2723]">{totalExpenses.toLocaleString('ar-EG')} ج.م</span>
              <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">8% ↘</span>
            </div>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[10px] text-[#3E2723]/50">صافي الربح</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-[#d4af37]">{netProfit.toLocaleString('ar-EG')} ج.م</span>
              <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">18% ↗</span>
            </div>
          </div>

        </div>

        {/* Footer mini bar-graph */}
        <div className="flex items-center gap-1.5 h-10 pr-6 border-r border-[#3E2723]/10">
          <span className="text-[10px] text-[#3E2723]/50 font-bold ml-2">نظرة عامة على الأداء</span>
          <div className="w-1.5 h-6 bg-[#3E2723]/15 rounded-full overflow-hidden flex flex-col justify-end">
            <div className="bg-[#d4af37] h-[40%] rounded-full" />
          </div>
          <div className="w-1.5 h-9 bg-[#3E2723]/15 rounded-full overflow-hidden flex flex-col justify-end">
            <div className="bg-[#d4af37] h-[65%] rounded-full" />
          </div>
          <div className="w-1.5 h-7 bg-[#3E2723]/15 rounded-full overflow-hidden flex flex-col justify-end">
            <div className="bg-[#d4af37] h-[55%] rounded-full" />
          </div>
          <div className="w-1.5 h-10 bg-[#3E2723]/15 rounded-full overflow-hidden flex flex-col justify-end">
            <div className="bg-[#d4af37] h-[80%] rounded-full" />
          </div>
        </div>

      </div>

    </div>
  );
}
