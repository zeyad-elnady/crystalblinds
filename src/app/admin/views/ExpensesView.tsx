'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

interface ExpenseRecord {
  id: string;
  category: 'salaries' | 'marketing' | 'rent' | 'fuel' | 'maintenance';
  amount: number;
  expense_date: string;
  notes: string;
  created_at?: string;
}

const CATEGORY_LABELS = {
  salaries: 'رواتب',
  marketing: 'تسويق',
  rent: 'إيجارات',
  fuel: 'وقود',
  maintenance: 'صيانة',
};

const CATEGORY_COLORS = {
  salaries: 'text-indigo-600 bg-indigo-50 border border-indigo-100',
  marketing: 'text-pink-600 bg-pink-50 border border-pink-100',
  rent: 'text-amber-600 bg-amber-50 border border-amber-100',
  fuel: 'text-orange-600 bg-orange-50 border border-orange-100',
  maintenance: 'text-teal-600 bg-teal-50 border border-teal-100',
};

export default function ExpensesView() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    category: 'marketing' as any,
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Filters state
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
        
      if (error) throw error;
      setExpenses((data || []).map((e: any) => ({
        id: e.id,
        category: e.category,
        amount: Number(e.amount) || 0,
        expense_date: e.expense_date,
        notes: e.notes || '',
      })));
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      category: 'marketing',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    try {
      await supabase.from('expenses').delete().eq('id', id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('الرجاء إدخال قيمة صحيحة للمصروف');
      return;
    }

    setSaving(true);
    const payload = {
      category: formData.category,
      amount: Number(formData.amount),
      expense_date: formData.expense_date,
      notes: formData.notes,
    };

    try {
      const { data, error } = await supabase.from('expenses').insert([payload]).select();
      if (error) throw error;
      if (data && data[0]) {
        setExpenses(prev => [{ ...data[0], amount: Number(data[0].amount) }, ...prev]);
      } else {
        fetchExpenses();
      }
      setShowAddModal(false);
    } catch {
      // Offline Simulation
      const mockNew = { id: 'exp-' + String(Date.now()), ...payload };
      setExpenses(prev => [mockNew, ...prev]);
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  };

  // Summaries
  const today = new Date().toISOString().split('T')[0];
  const todayTotal = useMemo(() => {
    return expenses.filter(e => e.expense_date === today).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, today]);

  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const monthTotal = useMemo(() => {
    return expenses.filter(e => e.expense_date.startsWith(currentMonth)).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentMonth]);

  // Categories distribution
  const categoryTotals = useMemo(() => {
    const totals = { salaries: 0, marketing: 0, rent: 0, fuel: 0, maintenance: 0 };
    expenses.forEach(e => {
      if (totals[e.category] !== undefined) {
        totals[e.category] += e.amount;
      }
    });
    return totals;
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchCat = filterCategory === 'all' || e.category === filterCategory;
      const matchDateFrom = !dateFrom || e.expense_date >= dateFrom;
      const matchDateTo = !dateTo || e.expense_date <= dateTo;
      return matchCat && matchDateFrom && matchDateTo;
    });
  }, [expenses, filterCategory, dateFrom, dateTo]);

  return (
    <div className="flex flex-col gap-6 text-[#3E2723]" style={{ direction: 'rtl' }}>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">إدارة المصروفات</h1>
          <p className="text-xs text-[#3E2723]/60">متابعة وتسجيل التدفقات المالية والمصاريف التشغيلية</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-[#d4af37] text-[#2B1B17] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#b8922a] transition-all shadow-[0_2px_8px_rgba(212,175,55,0.25)]"
        >
          <span className="material-symbols-outlined text-base">add_card</span>
          <span>تسجيل مصروف جديد</span>
        </button>
      </div>

      {/* Stats Cards Dashboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-[#3E2723]/60">مصروفات اليوم</span>
          <div className="flex items-baseline justify-between mt-4">
            <h2 className="text-2xl font-extrabold text-[#3E2723]">{todayTotal.toLocaleString('ar-EG')} ج.م</h2>
            <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold">حالي</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-[#3E2723]/60">إجمالي مصروفات الشهر الحالي</span>
          <div className="flex items-baseline justify-between mt-4">
            <h2 className="text-2xl font-extrabold text-[#d4af37]">{monthTotal.toLocaleString('ar-EG')} ج.م</h2>
            <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold">نشط</span>
          </div>
        </div>

        {/* Metric 3: Small Category Breakdown summary */}
        <div className="bg-white p-4 rounded-2xl border border-[#3E2723]/10 shadow-sm flex flex-col gap-2.5">
          <span className="text-xs font-bold text-[#3E2723]/50">توزيع بنود المصروفات (ج.م)</span>
          <div className="flex flex-wrap gap-2 text-[10px]">
            {Object.entries(categoryTotals).map(([cat, val]) => (
              <span key={cat} className={`px-2 py-0.5 rounded font-semibold border ${CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]}`}>
                {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}: {val.toLocaleString('en-US')}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Filters & Search Grid */}
      <div className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
              filterCategory === 'all' ? 'bg-[#3E2723] text-white border-[#3E2723]' : 'bg-[#FAF8F5] text-[#3E2723]/70'
            }`}
          >
            الكل
          </button>
          {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filterCategory === cat ? 'bg-[#3E2723] text-white border-[#3E2723]' : 'bg-[#FAF8F5] text-[#3E2723]/70 border-[#3E2723]/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        
        {/* Date Ranges */}
        <div className="flex items-center gap-2 text-xs">
          <span>من:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="border border-[#3E2723]/20 rounded-lg p-1 text-[11px] outline-none"
          />
          <span>إلى:</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="border border-[#3E2723]/20 rounded-lg p-1 text-[11px] outline-none"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3E2723]/10 border-top-[#d4af37] rounded-full animate-spin" />
            <span className="text-xs text-[#3E2723]/60">جاري تحميل المصروفات...</span>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-16 text-center text-[#3E2723]/40 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl">receipt_long</span>
            <span className="text-xs font-bold">لم يتم تسجيل أي مصروفات تطابق خيارات التصفية</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#3E2723]/10 text-[#3E2723]/50">
                  <th className="p-4 font-bold text-right">التصنيف</th>
                  <th className="p-4 font-bold text-right">المبلغ ج.م</th>
                  <th className="p-4 font-bold text-right">التاريخ</th>
                  <th className="p-4 font-bold text-right">البيان والملاحظات</th>
                  <th className="p-4 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(item => (
                  <tr key={item.id} className="border-b border-[#3E2723]/5 last:border-0 hover:bg-[#FAF8F5]/30 transition-colors">
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${CATEGORY_COLORS[item.category]}`}>
                        {CATEGORY_LABELS[item.category]}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-sm text-[#3E2723]">{item.amount.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-4 text-[#3E2723]/70 font-semibold">{item.expense_date}</td>
                    <td className="p-4 text-[#3E2723]/60 font-medium">{item.notes || '—'}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-7 h-7 rounded-lg inline-flex items-center justify-center border border-[#3E2723]/10 hover:border-red-500 text-[#3E2723]/50 hover:text-red-600 bg-white"
                        title="حذف المصروف"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[2000]" style={{ direction: 'rtl' }}>
          <div className="bg-white rounded-2xl border border-[#3E2723]/15 w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#3E2723] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">تسجيل مصروف جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/60 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E2723]/70">تصنيف المصروف *</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                >
                  <option value="salaries">رواتب وأجور</option>
                  <option value="marketing">حملات تسويقية ودعاية</option>
                  <option value="rent">إيجارات المعارض والمصنع</option>
                  <option value="fuel">محروقات ونقل سيارات</option>
                  <option value="maintenance">ورش وتصليح ماكينات ومعدات</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">قيمة المصروف (ج.م) *</label>
                  <input
                    type="number" required
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">التاريخ</label>
                  <input
                    type="date" required
                    value={formData.expense_date}
                    onChange={e => setFormData(prev => ({ ...prev, expense_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E2723]/70">البيان والتفاصيل</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="اكتب تفاصيل الفاتورة أو البند هنا..."
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none resize-none"
                />
              </div>

              <div className="flex gap-2.5 mt-3 justify-end">
                <button
                  type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#3E2723]/20 rounded-xl text-xs font-bold hover:bg-[#3E2723]/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit" disabled={saving}
                  className="px-5 py-2 bg-[#d4af37] text-[#2B1B17] font-bold rounded-xl text-xs hover:bg-[#b8922a] disabled:opacity-50"
                >
                  {saving ? 'جاري التسجيل...' : 'تسجيل المصروف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
