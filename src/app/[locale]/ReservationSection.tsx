'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { AppointmentType } from '@/lib/supabase';

interface Props { isAr: boolean; }

const TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const AR_DAYS   = ['أح','اث','ث','أر','خ','ج','س'];
const EN_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const EN_DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export default function ReservationSection({ isAr }: Props) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [apptType, setApptType] = useState<AppointmentType>('inspection');
  const [bookedSlots, setBookedSlots] = useState<{ date: string; time: string }[]>([]);
  const [step, setStep]   = useState<1 | 2>(1);
  const [form, setForm]   = useState({ name: '', phone: '', email: '', address: '', notes: '', curtainType: '', systemType: 'manual', motorBrand: 'somfy' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]   = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<{ id: string; labelEn: string; labelAr: string }[]>([]);

  // Fetch existing appointments for availability and active products
  useEffect(() => {
    supabase.from('appointments')
      .select('appointment_date, appointment_time')
      .in('status', ['pending', 'confirmed'])
      .then(({ data }) => {
        if (data) setBookedSlots(data.map(d => ({ date: d.appointment_date, time: d.appointment_time?.slice(0,5) })));
      });

    supabase.from('products')
      .select('id, label_en, label_ar')
      .eq('is_active', true)
      .then(({ data }) => {
        if (data) {
          setProducts(data.map(d => ({
            id: d.id,
            labelEn: d.label_en || '',
            labelAr: d.label_ar || ''
          })));
        }
      });
  }, []);

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDay     = getFirstDayOfMonth(year, month);
  const todayStr     = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const makeDate = (d: number) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const countBooked = (dateStr: string) => bookedSlots.filter(s => s.date === dateStr).length;
  const isTimeBooked = (t: string) => selectedDate ? bookedSlots.some(s => s.date === selectedDate && s.time === t) : false;

  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); setSelectedDate(''); setSelectedTime(''); };
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0); } else setMonth(m => m+1); setSelectedDate(''); setSelectedTime(''); };

  const handleSubmit = async () => {
    if (!form.name || !form.phone) { setError(isAr ? 'الاسم والهاتف مطلوبان' : 'Name and phone are required'); return; }
    if (!form.curtainType) { setError(isAr ? 'يرجى اختيار نوع الستائر' : 'Please select curtain type'); return; }
    setSubmitting(true); setError('');

    let finalNotes = form.notes;
    if (form.email) {
      finalNotes = `[البريد الإلكتروني: ${form.email}]\n${finalNotes}`;
    }
    if (form.systemType !== 'manual') {
      const sysStr = form.systemType === 'smart_app' ? 'Smart App' : 'Remote Control';
      const motorStr = form.motorBrand === 'somfy' ? 'Somfy' : 'Azzaro';
      finalNotes = `[نظام ذكي: ${sysStr} | موتور: ${motorStr}]\n${finalNotes}`;
    }

    const { error: err } = await supabase.from('appointments').insert([{
      client_name: form.name, client_phone: form.phone,
      client_address: form.address, appointment_type: apptType,
      curtain_type: form.curtainType,
      appointment_date: selectedDate, appointment_time: selectedTime + ':00',
      notes: finalNotes, status: 'pending',
    }]);
    if (err) { 
      setError(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong. Try again.'); 
    } else { 
      setDone(true); 
    }
    setSubmitting(false);
  };

  const getFriendlyDate = (dStr: string) => {
    if (!dStr) return '';
    const date = new Date(dStr + 'T12:00');
    return date.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (done) return (
    <section id="reserve" className={`py-24 px-6 md:px-12 bg-[#FFFDFA] ${isAr ? 'rtl text-right' : ''}`}>
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#d4af37] text-4xl">check_circle</span>
        </div>
        <h3 className="font-headline text-3xl text-[#3E2723] font-bold">{isAr ? 'تم الحجز بنجاح!' : 'Booking Confirmed!'}</h3>
        <p className="text-[#3E2723]/70 font-light">{isAr ? 'سنتواصل معك قريباً لتأكيد الموعد.' : 'We will contact you shortly to confirm your appointment.'}</p>
        <button onClick={() => { setDone(false); setStep(1); setSelectedDate(''); setSelectedTime(''); setForm({ name:'',phone:'',email:'',address:'',notes:'', curtainType: '', systemType: 'manual', motorBrand: 'somfy' }); }}
          className="mt-4 px-8 py-3.5 bg-[#3E2723] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#d4af37] transition-all duration-300 shadow-md">
          {isAr ? 'حجز موعد آخر' : 'Book Another'}
        </button>
      </div>
    </section>
  );

  return (
    <section id="reserve" className={`py-24 px-6 md:px-12 bg-[#FFFDFA] relative overflow-hidden ${isAr ? 'rtl' : ''}`}>
      {/* Ambient backgrounds */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#3E2723]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <div className="mb-14 flex flex-col items-center text-center max-w-3xl mx-auto relative">
          <span className="text-[#d4af37] uppercase tracking-[0.3em] text-xs font-semibold mb-3 block">
            {isAr ? 'احجز موعدك' : 'Book an Appointment'}
          </span>
          <h2 className="font-headline text-3xl md:text-5xl font-bold text-[#3E2723] leading-tight mb-4">
            {isAr ? 'احجز المعاينه مجانا' : 'Book Free Measurement'}
          </h2>
          <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mb-6" />
          <p className="text-[#3E2723]/70 font-light text-sm mt-1 max-w-lg mx-auto">
            {isAr ? 'اختر نوع الخدمة والتاريخ والوقت المناسب، وسيتواصل معك فريقنا لتأكيد الموعد.' : 'Choose a service type, date, and time. Our team will contact you to confirm.'}
          </p>
        </div>

        {/* Step indicators */}
        <div className={`flex items-center justify-center gap-4 mb-10 ${isAr ? 'flex-row-reverse' : ''}`}>
          {[1, 2].map(s => (
            <div key={s} className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= s ? 'bg-[#3E2723] text-white shadow-sm' : 'bg-[#3E2723]/10 text-[#3E2723]/40'}`}>
                {s}
              </div>
              <span className={`text-sm font-semibold transition-all duration-300 ${step >= s ? 'text-[#3E2723]' : 'text-[#3E2723]/40'}`}>
                {s === 1 ? (isAr ? 'اختر الموعد' : 'Pick a Slot') : (isAr ? 'بياناتك' : 'Your Details')}
              </span>
              {s < 2 && <div className={`w-12 h-px mx-2 ${step > s ? 'bg-[#d4af37]' : 'bg-[#3E2723]/15'}`} />}
            </div>
          ))}
        </div>

        {/* Unified Booking Grid */}
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Visual Showcase Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full">
            <div className="relative flex-1 min-h-[320px] rounded-[2rem] overflow-hidden shadow-lg border border-[#3E2723]/10 group">
              <img 
                src="/photos for crystal/moa.jpg.jpeg" 
                alt={isAr ? "احجز المعاينه مجانا" : "Book Free Measurement"} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 absolute inset-0" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B17]/95 via-[#2B1B17]/40 to-transparent flex flex-col justify-end p-8 text-white z-10">
                <span className="text-[#d4af37] uppercase tracking-widest text-[10px] font-bold mb-2">
                  {isAr ? "دقة واحترافية" : "Precision & Care"}
                </span>
                <h3 className="font-headline text-2xl font-bold mb-2">
                  {isAr ? "احجز المعاينه مجانا" : "Book Free Measurement"}
                </h3>
                <p className="text-white/80 font-light text-xs leading-relaxed">
                  {isAr 
                    ? "مهندسونا سيقومون برفع المقاسات وعرض كتالوجات الأقمشة مباشرة في مساحتك الخاصة لضمان نتيجة مثالية." 
                    : "Our designers will measure your windows and showcase fabric catalogs in your space to guarantee a flawless fit."}
                </p>
              </div>
            </div>

            <div className="bg-[#2B1B17] rounded-[2rem] p-6 text-white border border-[#d4af37]/20 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-full blur-xl pointer-events-none" />
              <h4 className="font-bold text-xs text-[#d4af37] uppercase tracking-wider mb-3 border-b border-white/10 pb-2">
                {isAr ? "ماذا تشمل المعاينة المجانية؟" : "What is included?"}
              </h4>
              <ul className="space-y-2.5 text-[11px] text-white/80">
                <li className={`flex gap-3 items-start ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                  <span className="material-symbols-outlined text-[#d4af37] text-xs shrink-0">check_circle</span>
                  <span>{isAr ? "رفع المقاسات بدقة متناهية لتجنب أي أخطاء" : "Precise measurements to avoid any custom-fit errors"}</span>
                </li>
                <li className={`flex gap-3 items-start ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                  <span className="material-symbols-outlined text-[#d4af37] text-xs shrink-0">check_circle</span>
                  <span>{isAr ? "عرض عينات الأقمشة والكتالوجات لاختيار الألوان المناسبة" : "Browsing fabric swatches and dynamic catalogs on-site"}</span>
                </li>
                <li className={`flex gap-3 items-start ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                  <span className="material-symbols-outlined text-[#d4af37] text-xs shrink-0">check_circle</span>
                  <span>{isAr ? "استشارة فنية متكاملة لتحديد الموديل الأنسب" : "Expert guidance to choose the ideal system style"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Interactive Card */}
          <div className="lg:col-span-7 bg-white border-2 border-[#3E2723]/10 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(62,39,35,0.04)] hover:border-[#d4af37]/20 transition-all duration-300 flex flex-col justify-between">
            
            {step === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                
                {/* ── Left Column: Calendar & Service Selection ── */}
                <div className="flex flex-col">
                  {/* Type selector (Service Mode) */}
                  <div className={`flex gap-3 mb-6 p-1 bg-[#3E2723]/5 rounded-xl border border-[#3E2723]/10 ${isAr ? 'flex-row-reverse' : ''}`}>
                    {(['inspection', 'installation'] as AppointmentType[]).map(t => (
                      <button 
                        key={t} 
                        type="button"
                        onClick={() => setApptType(t)}
                        className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 ${apptType === t ? 'bg-[#3E2723] text-white shadow-md' : 'text-[#3E2723]/70 hover:text-[#3E2723] hover:bg-[#3E2723]/5'}`}
                      >
                        {t === 'inspection' ? (isAr ? 'معاينة' : 'Inspection') : (isAr ? 'تركيب' : 'Installation')}
                      </button>
                    ))}
                  </div>

                  {/* Month Navigation */}
                  <div className={`flex items-center justify-between mb-5 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <button 
                      type="button"
                      onClick={prevMonth} 
                      className="w-8 h-8 rounded-full border border-[#3E2723]/10 flex items-center justify-center hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all"
                    >
                      <span className="material-symbols-outlined text-[#3E2723] text-base">{isAr ? 'chevron_right' : 'chevron_left'}</span>
                    </button>
                    <span className="font-headline text-[#3E2723] font-bold text-xs sm:text-sm tracking-wide">
                      {isAr ? AR_MONTHS[month] : EN_MONTHS[month]} {year}
                    </span>
                    <button 
                      type="button"
                      onClick={nextMonth} 
                      className="w-8 h-8 rounded-full border border-[#3E2723]/10 flex items-center justify-center hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all"
                    >
                      <span className="material-symbols-outlined text-[#3E2723] text-base">{isAr ? 'chevron_left' : 'chevron_right'}</span>
                    </button>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 mb-2">
                    {(isAr ? AR_DAYS : EN_DAYS).map(d => (
                      <div key={d} className="text-center text-[10px] sm:text-[11px] font-bold text-[#3E2723]/40 py-1">{d}</div>
                    ))}
                  </div>

                  {/* Day Cells */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const d = i + 1;
                      const dateStr = makeDate(d);
                      const isPast  = dateStr < todayStr;
                      const booked  = countBooked(dateStr);
                      const isSel   = dateStr === selectedDate;
                      const isToday = dateStr === todayStr;
                      const full    = booked >= TIMES.length;
                      return (
                        <button 
                          key={d} 
                          type="button"
                          disabled={isPast || full}
                          onClick={() => { setSelectedDate(dateStr); setSelectedTime(''); }}
                          className={`relative aspect-square rounded-xl text-xs sm:text-sm font-semibold flex flex-col items-center justify-center transition-all duration-200
                            ${isSel ? 'bg-[#3E2723] text-white shadow-md scale-105' : ''}
                            ${!isSel && isToday ? 'border border-[#d4af37] text-[#3E2723] font-bold' : ''}
                            ${!isSel && !isToday && !isPast && !full ? 'hover:bg-[#d4af37]/10 text-[#3E2723]' : ''}
                            ${isPast || full ? 'text-[#3E2723]/25 cursor-not-allowed opacity-40' : ''}
                          `}
                        >
                          <span>{d}</span>
                          {booked > 0 && !isSel && !isPast && (
                            <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${full ? 'bg-red-400' : 'bg-[#d4af37]'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className={`flex items-center gap-4 mt-5 text-[10px] text-[#3E2723]/50 ${isAr ? 'flex-row-reverse justify-end' : ''}`}>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-[#d4af37]" />
                      {isAr ? 'محجوز جزئياً' : 'Partially booked'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                      {isAr ? 'ممتلئ' : 'Full'}
                    </span>
                  </div>
                </div>

                {/* ── Right Column: Time Slots & Summary ── */}
                <div className="flex flex-col justify-between h-full">
                  <div className="flex flex-col gap-4">
                    <h4 className={`font-semibold text-[#3E2723] text-sm ${isAr ? 'text-right' : 'text-left'}`}>
                      {selectedDate
                        ? (isAr ? `الأوقات المتاحة — ${new Date(selectedDate+'T12:00').toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'})}` : `Available Times — ${new Date(selectedDate+'T12:00').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}`)
                        : (isAr ? 'اختر يوماً أولاً لرؤية الأوقات' : 'Select a day to view times')}
                    </h4>
                    
                    {selectedDate ? (
                      <div className="grid grid-cols-3 gap-2">
                        {TIMES.map(t => {
                          const booked = isTimeBooked(t);
                          const isSel  = t === selectedTime;
                          return (
                            <button 
                              key={t} 
                              type="button"
                              disabled={booked} 
                              onClick={() => setSelectedTime(t)}
                              className={`py-3 rounded-lg text-xs sm:text-sm font-semibold border transition-all duration-200
                                ${isSel ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-sm' : ''}
                                ${!isSel && !booked ? 'border-[#3E2723]/15 text-[#3E2723] hover:border-[#d4af37] hover:bg-[#d4af37]/5' : ''}
                                ${booked ? 'bg-[#3E2723]/5 text-[#3E2723]/25 border-transparent cursor-not-allowed line-through' : ''}
                              `}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-44 flex flex-col items-center justify-center text-[#3E2723]/35 text-sm gap-3 border border-dashed border-[#3E2723]/10 rounded-2xl bg-[#3E2723]/5 p-6">
                        <span className="material-symbols-outlined text-4xl">schedule</span>
                        <span className="text-center font-light">{isAr ? 'الرجاء اختيار تاريخ من التقويم لعرض الساعات المتاحة' : 'Please select a date from the calendar to show available slots'}</span>
                      </div>
                    )}
                  </div>

                  {/* Summary & Next Button */}
                  <div className="mt-8 flex flex-col gap-4">
                    {selectedDate && selectedTime && (
                      <div className={`bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-xl p-4 text-xs sm:text-sm text-[#3E2723] ${isAr ? 'text-right' : 'text-left'}`}>
                        <p className="font-bold mb-1">{isAr ? 'ملخص الاختيار' : 'Selection Summary'}</p>
                        <p className="text-[#3E2723]/70 font-light">
                          {isAr ? (apptType === 'inspection' ? 'معاينة' : 'تركيب') : (apptType === 'inspection' ? 'Inspection' : 'Installation')} · {selectedDate} · {selectedTime}
                        </p>
                      </div>
                    )}

                    <button 
                      type="button"
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setStep(2)}
                      className="w-full py-4 bg-[#3E2723] text-white rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-[#d4af37] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none shadow-[0_10px_25px_rgba(62,39,35,0.12)] flex items-center justify-center gap-2"
                    >
                      <span>{isAr ? 'التالي — أدخل بياناتك' : 'Next — Enter Details'}</span>
                      <span className={`material-symbols-outlined text-base ${isAr ? 'rotate-180' : ''}`}>arrow_forward</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              /* Step 2 ── Form Details (2-Column inside card on desktop) */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
                
                {/* ── Left Column: Slot Summary Info Box (col-span-5) ── */}
                <div className="md:col-span-5 flex flex-col h-full justify-between">
                  <div className="relative bg-[#3E2723] bg-gradient-to-br from-[#3E2723] to-[#1c110f] border border-[#d4af37]/20 rounded-2xl p-6 text-[#FFFDFA] overflow-hidden flex flex-col justify-between min-h-[300px] shadow-md">
                    {/* Decorative quote icon background */}
                    <div className={`absolute -bottom-6 ${isAr ? "-left-6" : "-right-6"} text-white/5 pointer-events-none select-none`}>
                      <span className="material-symbols-outlined text-[140px] font-bold">calendar_month</span>
                    </div>

                    <div className="relative z-10">
                      <div className={`flex justify-between items-center mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[#d4af37] uppercase tracking-[0.2em] text-[10px] font-bold">
                          {isAr ? 'تفاصيل الموعد' : 'APPOINTMENT SLOT'}
                        </span>
                        <button 
                          type="button"
                          onClick={() => setStep(1)} 
                          className="text-xs font-bold text-white/60 hover:text-[#d4af37] transition-all flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
                        >
                          <span className={`material-symbols-outlined text-sm ${isAr ? '' : 'rotate-180'}`}>arrow_forward</span>
                          {isAr ? 'تعديل' : 'Edit'}
                        </button>
                      </div>

                      <div className="flex flex-col gap-5 mt-4">
                        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                          <span className="material-symbols-outlined text-[#d4af37] text-[20px]">design_services</span>
                          <div>
                            <p className="text-[10px] text-white/55 uppercase font-semibold">{isAr ? 'الخدمة' : 'Service'}</p>
                            <p className="text-sm font-bold text-white">
                              {apptType === 'inspection' ? (isAr ? 'معاينة ورفع مقاسات مجانية' : 'Free Inspection & Measurements') : (isAr ? 'تركيب احترافي للستائر' : 'Professional Blinds Installation')}
                            </p>
                          </div>
                        </div>

                        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                          <span className="material-symbols-outlined text-[#d4af37] text-[20px]">calendar_today</span>
                          <div>
                            <p className="text-[10px] text-white/55 uppercase font-semibold">{isAr ? 'التاريخ' : 'Date'}</p>
                            <p className="text-sm font-bold text-white">{getFriendlyDate(selectedDate)}</p>
                          </div>
                        </div>

                        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                          <span className="material-symbols-outlined text-[#d4af37] text-[20px]">schedule</span>
                          <div>
                            <p className="text-[10px] text-white/55 uppercase font-semibold">{isAr ? 'الوقت' : 'Time'}</p>
                            <p className="text-sm font-bold text-white">{selectedTime} {isAr ? 'صباحاً/مساءً' : ''}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 border-t border-white/10 pt-4 mt-6 text-[11px] text-white/60 font-light leading-relaxed">
                      {isAr 
                        ? "سيتواصل معك مهندسونا هاتفياً قبل الزيارة بـ 24 ساعة لتأكيد التفاصيل النهائية."
                        : "Our engineers will contact you by phone 24 hours prior to the visit to confirm details."}
                    </div>
                  </div>
                </div>

                {/* ── Right Column: Input Form Fields (col-span-7) ── */}
                <div className="md:col-span-7 flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37] ${isAr ? 'text-right' : 'text-left'}`}>
                      {isAr ? 'اختر الستارة / المنتج *' : 'Select Curtain / Product *'}
                    </label>
                    <select 
                      value={form.curtainType} 
                      onChange={e => setForm(p => ({ ...p, curtainType: e.target.value }))}
                      className={`bg-transparent border-b border-[#3E2723]/20 pb-3 text-[#3E2723] focus:outline-none focus:border-[#d4af37] transition-colors text-sm ${isAr ? 'text-right' : 'text-left'}`}
                    >
                      <option value="">{isAr ? 'اختر الستارة' : 'Select Curtain'}</option>
                      {products.map(p => (
                        <option key={p.id} value={isAr ? p.labelAr : p.labelEn}>
                          {isAr ? p.labelAr : p.labelEn}
                        </option>
                      ))}
                      <option value="custom">{isAr ? 'أخرى / مخصص' : 'Other / Custom'}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37] ${isAr ? 'text-right' : 'text-left'}`}>
                      {isAr ? 'نظام التشغيل' : 'Operation System'}
                    </label>
                    <select 
                      value={form.systemType} 
                      onChange={e => setForm(p => ({ ...p, systemType: e.target.value }))}
                      className={`bg-transparent border-b border-[#3E2723]/20 pb-3 text-[#3E2723] focus:outline-none focus:border-[#d4af37] transition-colors text-sm ${isAr ? 'text-right' : 'text-left'}`}
                    >
                      <option value="manual">{isAr ? 'يدوي (Manual)' : 'Manual'}</option>
                      <option value="smart_app">{isAr ? 'تطبيق ذكي (Smart App)' : 'Smart App'}</option>
                      <option value="remote">{isAr ? 'ريموت كنترول (Remote Control)' : 'Remote Control'}</option>
                    </select>
                  </div>

                  {form.systemType !== 'manual' && (
                    <div className="flex flex-col gap-1.5 mb-2">
                      <label className={`text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37] ${isAr ? 'text-right' : 'text-left'}`}>
                        {isAr ? 'الماركة (الموتور)' : 'Motor Brand'}
                      </label>
                      <select 
                        value={form.motorBrand} 
                        onChange={e => setForm(p => ({ ...p, motorBrand: e.target.value }))}
                        className={`bg-transparent border-b border-[#3E2723]/20 pb-3 text-[#3E2723] focus:outline-none focus:border-[#d4af37] transition-colors text-sm ${isAr ? 'text-right' : 'text-left'}`}
                      >
                        <option value="somfy">{isAr ? 'سومفي (ضمان 10 سنوات)' : 'Somfy (10 Years Warranty)'}</option>
                        <option value="azzaro">{isAr ? 'أزارو (ضمان 5 سنوات)' : 'Azzaro (5 Years Warranty)'}</option>
                      </select>
                      
                      {form.systemType === 'smart_app' && (
                        <p className={`text-xs text-[#3E2723]/80 mt-2 bg-[#d4af37]/10 border border-[#d4af37]/20 p-3 rounded-xl ${isAr ? 'text-right' : 'text-left'}`}>
                          <span className="font-bold text-[#3E2723]">{isAr ? 'تنبيه:' : 'Note:'}</span> {isAr ? 'تأكد من وجود تأسيس سمارت (Smart Home) في المنزل.' : 'Ensure smart home infrastructure is already set up in your house.'}
                        </p>
                      )}
                      {form.systemType === 'remote' && (
                        <p className={`text-xs text-[#3E2723]/80 mt-2 bg-[#d4af37]/10 border border-[#d4af37]/20 p-3 rounded-xl ${isAr ? 'text-right' : 'text-left'}`}>
                          <span className="font-bold text-[#3E2723]">{isAr ? 'تنبيه:' : 'Note:'}</span> {isAr ? 'تأكد من توفير وصلة كهرباء (أرضي وكهرباء) بالقرب من الشباك.' : 'Ensure a power connection is available near the window.'}
                        </p>
                      )}
                    </div>
                  )}

                  {[
                    { key: 'name',    label: isAr ? 'الاسم الكامل *' : 'Full Name *',    ph: isAr ? 'اسمك الكامل' : 'Your name',      type: 'text' },
                    { key: 'phone',   label: isAr ? 'رقم الهاتف *' : 'Phone Number *',   ph: '01xxxxxxxxx',                             type: 'tel', dir: 'ltr' },
                    { key: 'email',   label: isAr ? 'البريد الإلكتروني (اختياري)' : 'Email Address (Optional)', ph: 'example@mail.com', type: 'email', dir: 'ltr' },
                    { key: 'address', label: isAr ? 'العنوان' : 'Address',               ph: isAr ? 'عنوانك التفصيلي' : 'Your address', type: 'text' },
                    { key: 'notes',   label: isAr ? 'ملاحظات' : 'Notes',                 ph: isAr ? 'أي تفاصيل إضافية...' : 'Any extra details...', type: 'text' },
                  ].map(f => (
                    <div key={f.key} className="flex flex-col gap-1.5">
                      <label className={`text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37] ${isAr ? 'text-right' : 'text-left'}`}>{f.label}</label>
                      <input 
                        type={f.type} 
                        dir={f.dir} 
                        value={form[f.key as keyof typeof form]} 
                        placeholder={f.ph}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className={`bg-transparent border-b border-[#3E2723]/20 pb-3 text-[#3E2723] placeholder:text-[#3E2723]/30 focus:outline-none focus:border-[#d4af37] transition-colors text-sm ${isAr ? 'text-right' : 'text-left'}`} 
                      />
                    </div>
                  ))}

                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                  <button 
                    type="button"
                    onClick={handleSubmit} 
                    disabled={submitting}
                    className="mt-4 py-4 bg-[#3E2723] text-white rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-[#d4af37] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none shadow-[0_10px_25px_rgba(62,39,35,0.12)] flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">calendar_add_on</span>
                    {submitting ? (isAr ? 'جاري الحجز...' : 'Booking...') : (isAr ? 'تأكيد الحجز' : 'Confirm Booking')}
                  </button>
                </div>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
