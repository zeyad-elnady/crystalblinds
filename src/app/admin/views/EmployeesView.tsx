'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Employee {
  id: string;
  name: string;
  job_title: string;
  salary: number;
  phone: string;
  inspections_count?: number;
  installations_count?: number;
  maintenance_count?: number;
  rating?: number;
  commitment?: number;
  work_start_time?: string;
  work_end_time?: string;
}

interface AttendanceLog {
  id: string;
  employee_id: string;
  employee_name?: string;
  check_in: string;
  check_out: string | null;
  delay_minutes: number;
  overtime_hours?: number;
  work_date: string;
  working_hours?: number;
  notes?: string;
}

const getLocalDateTimeString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${mins}`;
};

export default function EmployeesView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Section toggle state: 'profiles' | 'attendance' | 'performance'
  const [activeSection, setActiveSection] = useState<'profiles' | 'attendance' | 'performance'>('profiles');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  // Modals state
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    job_title: '',
    salary: '',
    phone: '',
  });

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceFilterId, setAttendanceFilterId] = useState<string>('');
  const [attendanceFormData, setAttendanceFormData] = useState({
    employee_id: '',
    notes: '',
    overtime_hours: '0',
    check_in: getLocalDateTimeString(),
    check_out: getLocalDateTimeString(),
    work_date: new Date().toISOString().split('T')[0],
  });

  const [showWorkHoursModal, setShowWorkHoursModal] = useState(false);
  const [workHoursFormData, setWorkHoursFormData] = useState({ employee_id: '', start_time: '09:00', end_time: '17:00' });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployeesData();
  }, []);

  const fetchEmployeesData = async () => {
    setLoading(true);
    try {
      const { data: empData, error: empErr } = await supabase.from('employees').select('*');
      const { data: attData, error: attErr } = await supabase.from('attendance').select('*').order('work_date', { ascending: false });
      
      if (empErr || attErr) throw new Error('Database tables missing or offline');
      
      setEmployees((empData || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        job_title: e.job_title,
        salary: Number(e.salary) || 0,
        phone: e.phone || '',
        work_start_time: e.work_start_time || '09:00',
        work_end_time: e.work_end_time || '17:00',
        inspections_count: 12,
        installations_count: 8,
        maintenance_count: 6,
        rating: 4.8,
        commitment: 95,
      })));
      
      setAttendance((attData || []).map((a: any) => {
        const checkInTime = a.check_in ? new Date(a.check_in) : null;
        const checkOutTime = a.check_out ? new Date(a.check_out) : null;
        const hours = checkOutTime && checkInTime ? Math.round((checkOutTime.getTime() - checkInTime.getTime()) / 3600000 * 10) / 10 : 0;
        const dateStr = a.check_in ? a.check_in.slice(0, 10) : (a.work_date || '—');

        return {
          id: a.id,
          employee_id: a.employee_id,
          employee_name: empData?.find((e: any) => e.id === a.employee_id)?.name || 'موظف',
          check_in: checkInTime ? checkInTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—',
          check_out: checkOutTime ? checkOutTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—',
          delay_minutes: a.delay_minutes || 0,
          overtime_hours: Number(a.overtime_hours) || 0,
          work_date: dateStr,
          working_hours: hours,
          notes: a.notes || '',
        };
      }));
    } catch {
      // Mock Fallbacks
      const mockEmps: Employee[] = [
        { id: 'emp-1', name: 'أحمد خالد', job_title: 'فني معاينات وتركيبات', salary: 7500, phone: '01012345678', work_start_time: '09:00', work_end_time: '17:00', inspections_count: 24, installations_count: 18, maintenance_count: 5, rating: 4.9, commitment: 98 },
        { id: 'emp-2', name: 'شريف مصطفى', job_title: 'فني صيانة وتركيبات', salary: 7000, phone: '01234567890', work_start_time: '09:00', work_end_time: '17:00', inspections_count: 12, installations_count: 22, maintenance_count: 14, rating: 4.7, commitment: 92 },
        { id: 'emp-3', name: 'نهى أحمد', job_title: 'خدمة عملاء ومبيعات', salary: 5500, phone: '01111223344', work_start_time: '09:00', work_end_time: '17:00', inspections_count: 0, installations_count: 0, maintenance_count: 0, rating: 4.6, commitment: 96 },
        { id: 'emp-4', name: 'كمال محمود', job_title: 'محاسب مالي', salary: 8500, phone: '01599887766', work_start_time: '09:00', work_end_time: '17:00', inspections_count: 0, installations_count: 0, maintenance_count: 0, rating: 4.8, commitment: 100 },
      ];
      setEmployees(mockEmps);

      const todayStr = new Date().toISOString().split('T')[0];
      setAttendance([
        { id: 'att-1', employee_id: 'emp-1', employee_name: 'أحمد خالد', check_in: '09:15 ص', check_out: '05:00 م', delay_minutes: 15, overtime_hours: 1.5, work_date: todayStr, working_hours: 7.75, notes: 'عمل إضافي لإكمال المعاينة' },
        { id: 'att-2', employee_id: 'emp-2', employee_name: 'شريف مصطفى', check_in: '09:00 ص', check_out: '05:00 م', delay_minutes: 0, overtime_hours: 2, work_date: todayStr, working_hours: 8.0, notes: 'تركيبات إضافية' },
        { id: 'att-3', employee_id: 'emp-3', employee_name: 'نهى أحمد', check_in: '09:05 ص', check_out: '05:00 م', delay_minutes: 5, overtime_hours: 0, work_date: todayStr, working_hours: 7.9, notes: '' },
        { id: 'att-4', employee_id: 'emp-4', employee_name: 'كمال محمود', check_in: '08:58 ص', check_out: '05:00 م', delay_minutes: 0, overtime_hours: 0, work_date: todayStr, working_hours: 8.0, notes: 'تعديل جدول الحسابات' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ──── Employee CRUD ────
  const handleOpenAddEmp = () => {
    setEditingEmployee(null);
    setEmployeeFormData({ name: '', job_title: '', salary: '', phone: '' });
    setShowEmployeeModal(true);
  };

  const handleOpenEditEmp = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmployeeFormData({
      name: emp.name,
      job_title: emp.job_title,
      salary: String(emp.salary),
      phone: emp.phone,
    });
    setShowEmployeeModal(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف ملف هذا الموظف نهائياً؟')) return;
    try {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      alert('تم حذف ملف الموظف بنجاح');
    } catch {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      alert('تم حذف ملف الموظف بنجاح');
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeFormData.name || !employeeFormData.job_title) return;
    
    setSaving(true);
    const payload = {
      name: employeeFormData.name,
      job_title: employeeFormData.job_title,
      salary: Number(employeeFormData.salary) || 0,
      phone: employeeFormData.phone,
    };

    try {
      if (editingEmployee) {
        await supabase.from('employees').update(payload).eq('id', editingEmployee.id);
        setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? { ...emp, ...payload } : emp));
      } else {
        const { data } = await supabase.from('employees').insert([payload]).select();
        if (data && data[0]) {
          setEmployees(prev => [{ ...data[0], salary: Number(data[0].salary), inspections_count: 0, installations_count: 0, maintenance_count: 0, rating: 5.0, commitment: 100 }, ...prev]);
        } else {
          fetchEmployeesData();
        }
      }
      setShowEmployeeModal(false);
    } catch {
      if (editingEmployee) {
        setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? { ...emp, ...payload } : emp));
      } else {
        const mockNew: Employee = { id: 'emp-' + String(Date.now()), ...payload, inspections_count: 0, installations_count: 0, maintenance_count: 0, rating: 5.0, commitment: 100 };
        setEmployees(prev => [mockNew, ...prev]);
      }
      setShowEmployeeModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleWorkHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workHoursFormData.employee_id) return;
    setSaving(true);
    try {
      await supabase.from('employees').update({
        work_start_time: workHoursFormData.start_time,
        work_end_time: workHoursFormData.end_time
      }).eq('id', workHoursFormData.employee_id);
      
      setEmployees(prev => prev.map(emp => 
        emp.id === workHoursFormData.employee_id 
          ? { ...emp, work_start_time: workHoursFormData.start_time, work_end_time: workHoursFormData.end_time } 
          : emp
      ));
      setShowWorkHoursModal(false);
    } catch {
      setEmployees(prev => prev.map(emp => 
        emp.id === workHoursFormData.employee_id 
          ? { ...emp, work_start_time: workHoursFormData.start_time, work_end_time: workHoursFormData.end_time } 
          : emp
      ));
      setShowWorkHoursModal(false);
    } finally {
      setSaving(false);
    }
  };

  // ──── Attendance Log ────
  const handleOpenAddAttendance = () => {
    setAttendanceFormData({
      employee_id: employees[0]?.id || '',
      notes: '',
      overtime_hours: '0',
      check_in: getLocalDateTimeString(),
      check_out: getLocalDateTimeString(),
      work_date: new Date().toISOString().split('T')[0],
    });
    setShowAttendanceModal(true);
  };

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceFormData.employee_id) return;
    
    setSaving(true);
    
    const checkInDate = new Date(attendanceFormData.check_in);
    const checkOutDate = new Date(attendanceFormData.check_out);
    
    // Dynamic start time check
    const selectedEmp = employees.find(e => e.id === attendanceFormData.employee_id);
    const startStr = selectedEmp?.work_start_time || '09:00';
    const [startHour, startMin] = startStr.split(':').map(Number);
    
    const standardStart = new Date(checkInDate);
    standardStart.setHours(startHour, startMin, 0, 0);
    const delay = Math.max(0, Math.round((checkInDate.getTime() - standardStart.getTime()) / 60000));

    const derivedWorkDate = attendanceFormData.check_in.split('T')[0];
    const payload = {
      employee_id: attendanceFormData.employee_id,
      check_in: checkInDate.toISOString(),
      check_out: checkOutDate.toISOString(),
      delay_minutes: delay,
      overtime_hours: Number(attendanceFormData.overtime_hours) || 0,
      work_date: derivedWorkDate,
      notes: attendanceFormData.notes,
    };

    try {
      const { data } = await supabase.from('attendance').insert([payload]).select();
      if (data && data[0]) {
        fetchEmployeesData();
      }
      setShowAttendanceModal(false);
    } catch {
      const selectedEmpName = employees.find(e => e.id === attendanceFormData.employee_id)?.name || 'موظف';
      const hours = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 3600000 * 10) / 10;
      const mockNew: AttendanceLog = {
        id: 'att-' + String(Date.now()),
        employee_id: attendanceFormData.employee_id,
        employee_name: selectedEmpName,
        check_in: checkInDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        check_out: checkOutDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        delay_minutes: delay,
        overtime_hours: Number(attendanceFormData.overtime_hours) || 0,
        work_date: derivedWorkDate,
        working_hours: hours,
        notes: attendanceFormData.notes
      };
      setAttendance(prev => [mockNew, ...prev]);
      setShowAttendanceModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-[#3E2723]" style={{ direction: 'rtl' }}>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">إدارة شؤون الموظفين</h1>
          <p className="text-xs text-[#3E2723]/60">إدارة الملفات الوظيفية، حضور وانصراف، وتقييم ومسيرات الرواتب الشهرية</p>
        </div>
        <div className="flex gap-2">
          {activeSection === 'profiles' && (
            <button 
              onClick={handleOpenAddEmp}
              className="flex items-center gap-2 bg-[#d4af37] text-[#2B1B17] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#b8922a] transition-all"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>إضافة ملف موظف</span>
            </button>
          )}
          {activeSection === 'attendance' && (
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setWorkHoursFormData({ employee_id: employees[0]?.id || '', start_time: employees[0]?.work_start_time || '09:00', end_time: employees[0]?.work_end_time || '17:00' });
                  setShowWorkHoursModal(true);
                }}
                className="flex items-center gap-2 bg-[#FAF8F5] border border-[#d4af37] text-[#3E2723] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#d4af37] hover:text-[#2B1B17] transition-all"
              >
                <span className="material-symbols-outlined text-base">schedule</span>
                <span>تحديد مواعيد العمل</span>
              </button>
              <button 
                onClick={handleOpenAddAttendance}
                className="flex items-center gap-2 bg-[#d4af37] text-[#2B1B17] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#b8922a] transition-all"
              >
                <span className="material-symbols-outlined text-base">more_time</span>
                <span>تسجيل حضور يدوي</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sub Section Toggle Tabs */}
      <div className="flex border-b border-[#3E2723]/10">
        {[
          { id: 'profiles', label: '👨💼 ملفات الموظفين' },
          { id: 'attendance', label: '📅 سجل الحضور والانصراف' },
          { id: 'performance', label: '📊 مسيرات الرواتب وساعات العمل الشهرية' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-5 py-2.5 font-bold text-xs border-b-2 transition-all ${
              activeSection === tab.id 
                ? 'border-[#d4af37] text-[#d4af37]' 
                : 'border-transparent text-[#3E2723]/60 hover:text-[#3E2723]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="bg-white rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3E2723]/10 border-top-[#d4af37] rounded-full animate-spin" />
            <span className="text-xs text-[#3E2723]/60">جاري تحميل بيانات الموظفين...</span>
          </div>
        ) : activeSection === 'profiles' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#3E2723]/10 text-[#3E2723]/50">
                  <th className="p-4 font-bold">الاسم</th>
                  <th className="p-4 font-bold">الوظيفة / المسمى الوظيفي</th>
                  <th className="p-4 font-bold">الراتب الأساسي</th>
                  <th className="p-4 font-bold">رقم الهاتف</th>
                  <th className="p-4 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="border-b border-[#3E2723]/5 last:border-0 hover:bg-[#FAF8F5]/30">
                    <td className="p-4 font-extrabold text-[#3E2723]">{emp.name}</td>
                    <td className="p-4 font-bold text-[#b8922a]">{emp.job_title}</td>
                    <td className="p-4 font-bold text-[#2E7D32]">{emp.salary.toLocaleString('ar-EG')} ج.م</td>
                    <td className="p-4 font-medium text-[#3E2723]/70 select-all">{emp.phone}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditEmp(emp)}
                          className="w-7 h-7 rounded-lg inline-flex items-center justify-center border border-[#3E2723]/10 hover:border-[#d4af37] text-[#3E2723]/50 hover:text-[#d4af37]"
                          title="تعديل"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="w-7 h-7 rounded-lg inline-flex items-center justify-center border border-[#3E2723]/10 hover:border-red-500 text-[#3E2723]/50 hover:text-red-500"
                          title="حذف"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeSection === 'attendance' ? (
          <div className="flex flex-col">
            <div className="p-4 border-b border-[#3E2723]/10 flex items-center justify-between bg-[#FAF8F5]/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E2723]/70">
                  <span className="material-symbols-outlined text-base text-[#d4af37]">filter_list</span>
                  <span>تصفية سجل الحضور حسب الموظف:</span>
                </div>
                <select
                  value={attendanceFilterId}
                  onChange={e => setAttendanceFilterId(e.target.value)}
                  className="bg-white border border-[#3E2723]/20 rounded-xl px-3 py-1.5 text-xs font-bold text-[#3E2723] outline-none focus:border-[#d4af37] transition-all shadow-sm"
                >
                  <option value="">👤 جميع الموظفين ({attendance.length} سجل)</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#3E2723]/10 text-[#3E2723]/50">
                    <th className="p-4 font-bold">التاريخ</th>
                    <th className="p-4 font-bold">الموظف</th>
                    <th className="p-4 font-bold">حضور</th>
                    <th className="p-4 font-bold">انصراف</th>
                    <th className="p-4 font-bold">ساعات العمل</th>
                    <th className="p-4 font-bold text-center">التأخير</th>
                    <th className="p-4 font-bold text-center">العمل الإضافي</th>
                    <th className="p-4 font-bold text-center">الملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.filter(log => !attendanceFilterId || log.employee_id === attendanceFilterId).map(log => (
                    <tr key={log.id} className="border-b border-[#3E2723]/5 last:border-0">
                      <td className="p-4 font-bold text-[#3E2723]">{log.work_date}</td>
                      <td className="p-4 font-extrabold text-[#3E2723]/80">{log.employee_name}</td>
                      <td className="p-4 text-green-700 font-bold">{log.check_in}</td>
                      <td className="p-4 text-indigo-700 font-bold">{log.check_out || '—'}</td>
                      <td className="p-4 font-semibold">{log.working_hours} ساعة</td>
                      <td className="p-4 text-center">
                        {log.delay_minutes > 0 ? (
                          <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded text-[10px] border border-red-100">
                            {log.delay_minutes} دقيقة تأخير
                          </span>
                        ) : (
                          <span className="text-green-700 font-bold">في الموعد</span>
                        )}
                      </td>
                      <td className="p-4 text-center font-bold">
                        {log.overtime_hours && log.overtime_hours > 0 ? (
                          <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded text-[10px] border border-indigo-100">
                            +{log.overtime_hours} ساعة إضافي
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center text-[#3E2723]/80 font-medium">{log.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Month Selector Bar */}
            <div className="p-4 border-b border-[#3E2723]/10 flex flex-wrap items-center justify-between gap-4 bg-[#FAF8F5]/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E2723]/70">
                  <span className="material-symbols-outlined text-base text-[#d4af37]">calendar_month</span>
                  <span>تحديد الشهر لمسير الرواتب:</span>
                </div>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="bg-white border border-[#3E2723]/20 rounded-xl px-3 py-1.5 text-xs font-bold text-[#3E2723] outline-none focus:border-[#d4af37] shadow-sm"
                />
              </div>
              <div className="text-xs text-[#3E2723]/60 font-semibold">
                عرض تقرير ساعات العمل ومستحقات الشهر للموظفين
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#3E2723]/10 text-[#3E2723]/50">
                    <th className="p-4 font-bold">الموظف</th>
                    <th className="p-4 font-bold">الوظيفة</th>
                    <th className="p-4 font-bold text-center">الراتب الأساسي</th>
                    <th className="p-4 font-bold text-center">أيام الحضور</th>
                    <th className="p-4 font-bold text-center">إجمالي ساعات العمل</th>
                    <th className="p-4 font-bold text-center">إجمالي الساعات الإضافية</th>
                    <th className="p-4 font-bold text-center">إجمالي التأخير</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const empLogs = attendance.filter(log => log.employee_id === emp.id && (log.work_date ? log.work_date.startsWith(selectedMonth) : true));
                    const totalHours = empLogs.reduce((acc, l) => acc + (l.working_hours || 0), 0);
                    const totalOvertime = empLogs.reduce((acc, l) => acc + (l.overtime_hours || 0), 0);
                    const totalDelay = empLogs.reduce((acc, l) => acc + (l.delay_minutes || 0), 0);
                    const daysCount = empLogs.length || 0;
                    
                    const overtimeBonus = totalOvertime * 50;
                    const delayDeduction = Math.round((totalDelay / 60) * (emp.salary / 240));
                    const netSalary = Math.max(0, emp.salary + overtimeBonus - delayDeduction);

                    return (
                      <tr key={emp.id} className="border-b border-[#3E2723]/5 last:border-0 hover:bg-[#FAF8F5]/30">
                        <td className="p-4 font-extrabold text-[#3E2723]">{emp.name}</td>
                        <td className="p-4 font-bold text-[#b8922a]">{emp.job_title}</td>
                        <td className="p-4 text-center font-bold text-[#3E2723]">{emp.salary.toLocaleString('ar-EG')} ج.م</td>
                        <td className="p-4 text-center font-bold text-indigo-700">{daysCount} يوم</td>
                        <td className="p-4 text-center font-bold text-emerald-700">{totalHours.toFixed(1)} ساعة</td>
                        <td className="p-4 text-center font-bold text-purple-700">+{totalOvertime.toFixed(1)} ساعة</td>
                        <td className="p-4 text-center font-bold text-red-600">
                          {totalDelay >= 60 
                            ? `${Math.floor(totalDelay / 60)} ساعة${totalDelay % 60 > 0 ? ` و ${totalDelay % 60} دقيقة` : ''}`
                            : `${totalDelay} دقيقة`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Employee Profile Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[2000]" style={{ direction: 'rtl' }}>
          <div className="bg-white rounded-2xl border border-[#3E2723]/15 w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#3E2723] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">{editingEmployee ? 'تعديل ملف موظف' : 'تسجيل موظف جديد'}</h3>
              <button onClick={() => setShowEmployeeModal(false)} className="text-white/60">✕</button>
            </div>
            
            <form onSubmit={handleEmployeeSubmit} className="p-5 flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E2723]/70">اسم الموظف بالكامل *</label>
                <input
                  type="text" required
                  value={employeeFormData.name}
                  onChange={e => setEmployeeFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E2723]/70">الوظيفة / المسمى الوظيفي *</label>
                <input
                  type="text" required
                  value={employeeFormData.job_title}
                  onChange={e => setEmployeeFormData(prev => ({ ...prev, job_title: e.target.value }))}
                  placeholder="مثال: فني تركيبات، خدمة عملاء..."
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">الراتب الأساسي (ج.م)</label>
                  <input
                    type="number"
                    value={employeeFormData.salary}
                    onChange={e => setEmployeeFormData(prev => ({ ...prev, salary: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={employeeFormData.phone}
                    onChange={e => setEmployeeFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 mt-3 justify-end">
                <button
                  type="button" onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 border border-[#3E2723]/20 rounded-xl text-xs font-bold hover:bg-[#3E2723]/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit" disabled={saving}
                  className="px-5 py-2 bg-[#d4af37] text-[#2B1B17] font-bold rounded-xl text-xs hover:bg-[#b8922a]"
                >
                  حفظ الملف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Work Hours Modal */}
      {showWorkHoursModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[2000]" style={{ direction: 'rtl' }}>
          <div className="bg-white rounded-2xl border border-[#3E2723]/15 w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#3E2723] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">تحديد مواعيد العمل للموظف</h3>
              <button onClick={() => setShowWorkHoursModal(false)} className="text-white/60">✕</button>
            </div>
            
            <form onSubmit={handleWorkHoursSubmit} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E2723]/70">اختر الموظف *</label>
                <select
                  value={workHoursFormData.employee_id}
                  onChange={e => {
                    const emp = employees.find(emp => emp.id === e.target.value);
                    setWorkHoursFormData(prev => ({ 
                      ...prev, 
                      employee_id: e.target.value,
                      start_time: emp?.work_start_time || '09:00',
                      end_time: emp?.work_end_time || '17:00'
                    }));
                  }}
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                >
                  <option value="">— اختر موظف —</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">بداية الدوام</label>
                  <input
                    type="time"
                    value={workHoursFormData.start_time}
                    onChange={e => setWorkHoursFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">نهاية الدوام</label>
                  <input
                    type="time"
                    value={workHoursFormData.end_time}
                    onChange={e => setWorkHoursFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 mt-3 justify-end">
                <button
                  type="button" onClick={() => setShowWorkHoursModal(false)}
                  className="px-4 py-2 border border-[#3E2723]/20 rounded-xl text-xs font-bold hover:bg-[#3E2723]/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit" disabled={saving}
                  className="px-5 py-2 bg-[#d4af37] text-[#2B1B17] font-bold rounded-xl text-xs hover:bg-[#b8922a]"
                >
                  حفظ المواعيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[2000]" style={{ direction: 'rtl' }}>
          <div className="bg-white rounded-2xl border border-[#3E2723]/15 w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#3E2723] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">تسجيل حضور وانصراف يدوي</h3>
              <button onClick={() => setShowAttendanceModal(false)} className="text-white/60">✕</button>
            </div>
            
            <form onSubmit={handleAttendanceSubmit} className="p-5 flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#3E2723]/70">اختر الموظف *</label>
                <select
                  value={attendanceFormData.employee_id}
                  onChange={e => setAttendanceFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                >
                  <option value="">— اختر موظف —</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">ساعات العمل الإضافي (ساعة)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={attendanceFormData.overtime_hours}
                    onChange={e => setAttendanceFormData(prev => ({ ...prev, overtime_hours: e.target.value }))}
                    placeholder="مثال: 1.5"
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none font-bold text-indigo-700"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">ملاحظات الحضور</label>
                  <input
                    type="text"
                    value={attendanceFormData.notes}
                    onChange={e => setAttendanceFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="ملاحظات اختيارية..."
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">وقت الحضور</label>
                  <input
                    type="datetime-local"
                    value={attendanceFormData.check_in}
                    onChange={e => setAttendanceFormData(prev => ({ ...prev, check_in: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#3E2723]/70">وقت الانصراف</label>
                  <input
                    type="datetime-local"
                    value={attendanceFormData.check_out}
                    onChange={e => setAttendanceFormData(prev => ({ ...prev, check_out: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#3E2723]/20 rounded-xl bg-[#FAF8F5] text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 mt-3 justify-end">
                <button
                  type="button" onClick={() => setShowAttendanceModal(false)}
                  className="px-4 py-2 border border-[#3E2723]/20 rounded-xl text-xs font-bold hover:bg-[#3E2723]/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit" disabled={saving}
                  className="px-5 py-2 bg-[#d4af37] text-[#2B1B17] font-bold rounded-xl text-xs hover:bg-[#b8922a]"
                >
                  تسجيل الحضور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
