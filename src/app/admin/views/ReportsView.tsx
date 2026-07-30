'use client';

import { useState } from 'react';

export default function ReportsView() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reportsList = [
    { id: 'sales', title: '📊 تقرير المبيعات', desc: 'ملخص حجم المبيعات الإجمالي والمنتجات الأكثر طلباً.' },
    { id: 'profits', title: '📊 تقرير الأرباح', desc: 'حساب صافي الأرباح بعد خصم إجمالي المصروفات التشغيلية.' },
    { id: 'expenses', title: '📊 تقرير المصروفات', desc: 'متابعة بنود الصرف الكبرى وتوزيعها على الفروع.' },
    { id: 'clients', title: '📊 تقرير العملاء', desc: 'تقارير حول معدل نمو قاعدة العملاء وتوزيعهم الجغرافي.' },
    { id: 'employees', title: '📊 تقرير الموظفين', desc: 'سجل إنجاز الموظفين، ساعات العمل الإجمالية والتأخيرات.' },
    { id: 'installations', title: '📊 تقرير التركيبات', desc: 'معدل إنجاز طلبات التركيب وأوقات التسليم الفنية.' },
    { id: 'maintenance', title: '📊 تقرير الصيانة', desc: 'تحليل الأعطال الشائعة، تكاليف الصيانة وقطع الغيار.' },
    { id: 'inspections', title: '📊 تقرير المعاينات', desc: 'معدل إنجاز المعاينات اليومية ونسبة تحويل المعاينات لطلبات.' },
  ];

  const handlePrintReport = (reportTitle: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: 'Tajawal', sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #3E2723; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 24px; font-weight: bold; color: #3E2723; }
            .meta { font-size: 12px; color: #777; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { padding: 12px; border: 1px solid #ddd; text-align: right; }
            th { background-color: #FAF8F5; }
            .total { font-weight: bold; background: #FAF8F5; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">${reportTitle}</div>
              <div class="meta">تم التوليد في: ${new Date().toLocaleDateString('ar-EG')} | نظام كريستال للستائر</div>
            </div>
            <div style="font-weight: bold; color: #b8922a;">CRYSTAL BLINDS</div>
          </div>

          <p>هذا التقرير يحتوي على البيانات الإحصائية والملخصات التحليلية للفترة المحددة:</p>

          <table>
            <thead>
              <tr>
                <th>البند التحليلي</th>
                <th>القيمة الإحصائية</th>
                <th>معدل التغير مقارنة بالشهر السابق</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>معدل الأداء العام</td>
                <td>94%</td>
                <td>+4% ↗</td>
                <td style="color: green; font-weight: bold;">ممتاز</td>
              </tr>
              <tr>
                <td>إجمالي النشاط والعمليات المنجزة</td>
                <td>340 عملية</td>
                <td>+12% ↗</td>
                <td style="color: green; font-weight: bold;">مستقر</td>
              </tr>
              <tr>
                <td>التكلفة التقديرية والهدر</td>
                <td>4,500 ج.م</td>
                <td>-2% ↘</td>
                <td style="color: green; font-weight: bold;">منخفض</td>
              </tr>
              <tr class="total">
                <td>الإجمالي النهائي المقدر</td>
                <td>98,500 ج.م</td>
                <td>+8% ↗</td>
                <td>معتمد</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 80px; text-align: left; font-size: 14px;">
            <div>اعتماد المدير العام: ___________________</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="flex flex-col gap-6 text-[#3E2723]" style={{ direction: 'rtl' }}>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">التقارير التحليلية والمالية</h1>
          <p className="text-xs text-[#3E2723]/60">استخراج وتصدير تقارير الأداء والمبيعات والمصروفات وصيانة التركيبات</p>
        </div>
      </div>

      {/* Reports Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {reportsList.map(report => (
          <div 
            key={report.id} 
            className="bg-white p-5 rounded-2xl border border-[#3E2723]/10 hover:border-[#d4af37] shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
          >
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-sm text-[#3E2723] group-hover:text-[#b8922a] transition-colors">{report.title}</h3>
              <p className="text-[11px] text-[#3E2723]/60 leading-relaxed mt-1">{report.desc}</p>
            </div>
            
            <div className="flex items-center justify-between border-t border-[#3E2723]/5 pt-3 mt-2">
              <button 
                onClick={() => handlePrintReport(report.title)}
                className="flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#d4af37]/10 text-[#3E2723] hover:text-[#b8922a] px-3 py-1.5 rounded-xl text-[10px] font-bold border border-[#3E2723]/10 hover:border-[#d4af37]/25 transition-all"
              >
                <span className="material-symbols-outlined text-[13px]">download_for_offline</span>
                <span>تصدير وطباعة</span>
              </button>
              
              <span className="material-symbols-outlined text-[#3E2723]/20 text-lg group-hover:translate-x-[-4px] transition-transform">arrow_back</span>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Analytics Preview Widget Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-[#3E2723]">ملخص الأداء المالي والتشغيلي الموحد</h3>
            <p className="text-[10px] text-[#3E2723]/50">توقعات وتحليلات تراكمية للشهر الحالي</p>
          </div>
          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">النمو العام +14.2%</span>
        </div>

        <div className="h-48 w-full flex items-end justify-around relative pt-6 px-4 bg-[#FAF8F5] rounded-xl border border-[#3E2723]/5 overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5 py-4">
            <div className="border-t border-[#3E2723] w-full" />
            <div className="border-t border-[#3E2723] w-full" />
            <div className="border-t border-[#3E2723] w-full" />
          </div>

          {[
            { label: 'المبيعات', val: '80%', color: '#d4af37' },
            { label: 'الأرباح', val: '55%', color: '#3E2723' },
            { label: 'المصروفات', val: '40%', color: '#A1887F' },
            { label: 'المعاينات', val: '90%', color: '#2E7D32' },
            { label: 'التركيبات', val: '75%', color: '#D84315' },
            { label: 'الصيانة', val: '30%', color: '#00695C' },
          ].map((bar, i) => (
            <div key={i} className="flex flex-col items-center gap-2 h-full justify-end z-10 w-12">
              <div 
                className="w-4 rounded-t-md transition-all duration-500 hover:scale-105" 
                style={{ height: bar.val, backgroundColor: bar.color }} 
                title={`${bar.label}: ${bar.val}`}
              />
              <span className="text-[9px] font-bold text-[#3E2723]/70">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
