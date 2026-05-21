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
  const day = new Date(year, month, 1).getDay();
  // Convert Sun=0 to Sat=6 → shift so Sat is first for Arabic week
  return day;
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
  const [form, setForm]   = useState({ name: '', phone: '', address: '', notes: '', curtainType: '', systemType: 'manual', motorBrand: 'somfy' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]   = useState(false);
  const [error, setError] = useState('');

  // Fetch existing appointments for availability
  useEffect(() => {
    supabase.from('appointments')
      .select('appointment_date, appointment_time')
      .in('status', ['pending', 'confirmed'])
      .then(({ data }) => {
        if (data) setBookedSlots(data.map(d => ({ date: d.appointment_date, time: d.appointment_time?.slice(0,5) })));
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
    if (apptType === 'installation' && !form.curtainType) { setError(isAr ? 'يرجى اختيار نوع الستائر' : 'Please select curtain type'); return; }
    setSubmitting(true); setError('');

    let finalNotes = form.notes;
    if (form.systemType !== 'manual') {
      const sysStr = form.systemType === 'smart_app' ? 'Smart App' : 'Remote Control';
      const motorStr = form.motorBrand === 'somfy' ? 'Somfy' : 'Azzaro';
      finalNotes = `[نظام ذكي: ${sysStr} | موتور: ${motorStr}]\n${finalNotes}`;
    }

    const { error: err } = await supabase.from('appointments').insert([{
      client_name: form.name, client_phone: form.phone,
      client_address: form.address, appointment_type: apptType,
      curtain_type: apptType === 'installation' ? form.curtainType : null,
      appointment_date: selectedDate, appointment_time: selectedTime + ':00',
      notes: finalNotes, status: 'pending',
    }]);
    if (err) { setError(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong. Try again.'); }
    else { setDone(true); }
    setSubmitting(false);
  };

  if (done) return (
    <section id="reserve" className={`py-24 px-6 md:px-12 bg-[#faf8f5] ${isAr ? 'rtl text-right' : ''}`}>
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#d4af37] text-4xl">check_circle</span>
        </div>
        <h3 className="font-headline text-3xl text-[#6A311D]">{isAr ? 'تم الحجز بنجاح!' : 'Booking Confirmed!'}</h3>
        <p className="text-[#6A311D]/70">{isAr ? 'سنتواصل معك قريباً لتأكيد الموعد.' : 'We will contact you shortly to confirm your appointment.'}</p>
        <button onClick={() => { setDone(false); setStep(1); setSelectedDate(''); setSelectedTime(''); setForm({ name:'',phone:'',address:'',notes:'', curtainType: '', systemType: 'manual', motorBrand: 'somfy' }); }}
          className="mt-2 px-8 py-3 bg-[#C6AB8E] text-[#6A311D] rounded font-bold text-xs uppercase tracking-widest hover:bg-[#3d2b1f] transition-colors">
          {isAr ? 'حجز موعد آخر' : 'Book Another'}
        </button>
      </div>
    </section>
  );

  return (
    <section id="reserve" className={`py-24 px-6 md:px-12 bg-[#faf8f5] relative overflow-hidden ${isAr ? 'rtl' : ''}`}>
      {/* Ambient */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#d4af37]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#e9c176]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <div className={`mb-14 ${isAr ? 'text-right' : ''}`}>
          <span className="text-[#d4af37] uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">
            {isAr ? 'احجز موعدك' : 'Book an Appointment'}
          </span>
          <h3 className="font-headline text-4xl md:text-5xl text-[#6A311D] leading-tight">
            {isAr ? 'حدد وقتاً' : 'Schedule a'} <span className="text-[#d4af37] italic font-light">{isAr ? 'مناسباً لك' : 'Visit'}</span>
          </h3>
          <p className="text-[#6A311D]/70 text-sm mt-3 max-w-lg">{isAr ? 'اختر نوع الخدمة والتاريخ والوقت المناسب، وسيتواصل معك فريقنا لتأكيد الموعد.' : 'Choose a service type, date, and time. Our team will contact you to confirm.'}</p>
        </div>

        {/* Step indicators */}
        <div className={`flex items-center gap-4 mb-10 ${isAr ? 'flex-row-reverse' : ''}`}>
          {[1,2].map(s => (
            <div key={s} className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-[#C6AB8E] text-[#6A311D]' : 'bg-[#C6AB8E]/10 text-[#6A311D]/40'}`}>{s}</div>
              <span className={`text-sm font-medium ${step >= s ? 'text-[#6A311D]' : 'text-[#6A311D]/40'}`}>
                {s === 1 ? (isAr ? 'اختر الموعد' : 'Pick a Slot') : (isAr ? 'بياناتك' : 'Your Details')}
              </span>
              {s < 2 && <div className={`w-12 h-px mx-2 ${step > s ? 'bg-[#d4af37]' : 'bg-[#C6AB8E]/10'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">

          {/* ── Calendar ── */}
          <div className="bg-white/60 border border-white/50 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-[0_10px_30px_rgba(38,23,12,0.06)]">
            {/* Type selector */}
            <div className={`flex gap-3 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
              {(['inspection','installation'] as AppointmentType[]).map(t => (
                <button key={t} onClick={() => setApptType(t)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${apptType === t ? 'bg-[#C6AB8E] text-[#6A311D] border-[#6A311D]' : 'bg-white/50 border-[#6A311D]/20 text-[#6A311D]/70 hover:border-[#d4af37]'}`}>
                  {t === 'inspection' ? (isAr ? 'معاينة' : 'Inspection') : (isAr ? 'تركيب' : 'Installation')}
                </button>
              ))}
            </div>

            {/* Month nav */}
            <div className={`flex items-center justify-between mb-5 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button onClick={prevMonth} className="w-9 h-9 rounded-full border border-[#6A311D]/10 flex items-center justify-center hover:border-[#d4af37] transition-colors">
                <span className="material-symbols-outlined text-[#6A311D] text-lg">{isAr ? 'chevron_right' : 'chevron_left'}</span>
              </button>
              <span className="font-headline text-[#6A311D] font-semibold text-sm">
                {isAr ? AR_MONTHS[month] : EN_MONTHS[month]} {year}
              </span>
              <button onClick={nextMonth} className="w-9 h-9 rounded-full border border-[#6A311D]/10 flex items-center justify-center hover:border-[#d4af37] transition-colors">
                <span className="material-symbols-outlined text-[#6A311D] text-lg">{isAr ? 'chevron_left' : 'chevron_right'}</span>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {(isAr ? AR_DAYS : EN_DAYS).map(d => (
                <div key={d} className="text-center text-[10px] font-semibold text-[#6A311D]/40 py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
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
                  <button key={d} disabled={isPast || full}
                    onClick={() => { setSelectedDate(dateStr); setSelectedTime(''); }}
                    className={`relative aspect-square rounded-lg text-sm font-medium flex flex-col items-center justify-center transition-all duration-200
                      ${isSel ? 'bg-[#C6AB8E] text-[#6A311D] shadow-md' : ''}
                      ${!isSel && isToday ? 'border-2 border-[#d4af37] text-[#6A311D]' : ''}
                      ${!isSel && !isToday && !isPast && !full ? 'hover:bg-[#d4af37]/10 text-[#6A311D]' : ''}
                      ${isPast || full ? 'text-[#6A311D]/20 cursor-not-allowed' : ''}
                    `}>
                    <span>{d}</span>
                    {booked > 0 && !isSel && !isPast && (
                      <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${full ? 'bg-red-400' : 'bg-[#d4af37]'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className={`flex items-center gap-4 mt-5 text-[10px] text-[#6A311D]/50 ${isAr ? 'flex-row-reverse justify-end' : ''}`}>
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#d4af37]" />{isAr ? 'محجوز جزئياً' : 'Partially booked'}</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-red-400" />{isAr ? 'ممتلئ' : 'Full'}</span>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="flex flex-col gap-6">
            {step === 1 ? (
              <>
                {/* Time slots */}
                <div className="bg-white/60 border border-white/50 rounded-2xl p-6 backdrop-blur-xl shadow-[0_10px_30px_rgba(38,23,12,0.06)]">
                  <h4 className={`font-semibold text-[#6A311D] mb-4 text-sm ${isAr ? 'text-right' : ''}`}>
                    {selectedDate
                      ? (isAr ? `الأوقات المتاحة — ${new Date(selectedDate+'T12:00').toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'})}` : `Available Times — ${new Date(selectedDate+'T12:00').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}`)
                      : (isAr ? 'اختر يوماً أولاً' : 'Select a day first')}
                  </h4>
                  {selectedDate ? (
                    <div className="grid grid-cols-3 gap-2">
                      {TIMES.map(t => {
                        const booked = isTimeBooked(t);
                        const isSel  = t === selectedTime;
                        return (
                          <button key={t} disabled={booked} onClick={() => setSelectedTime(t)}
                            className={`py-2.5 rounded-lg text-sm font-medium border transition-all duration-200
                              ${isSel ? 'bg-[#C6AB8E] text-[#6A311D] border-[#6A311D]' : ''}
                              ${!isSel && !booked ? 'border-[#6A311D]/15 text-[#6A311D] hover:border-[#d4af37]' : ''}
                              ${booked ? 'bg-[#C6AB8E]/5 text-[#6A311D]/25 border-transparent cursor-not-allowed line-through' : ''}
                            `}>
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-[#6A311D]/30 text-sm">
                      {isAr ? 'سيظهر هنا الأوقات المتاحة' : 'Available times will appear here'}
                    </div>
                  )}
                </div>

                {/* Next step btn */}
                <button disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-[#C6AB8E] text-[#6A311D] rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-[#3d2b1f] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2">
                  <span>{isAr ? 'التالي — أدخل بياناتك' : 'Next — Enter Details'}</span>
                  <span className={`material-symbols-outlined text-base ${isAr ? 'rotate-180' : ''}`}>arrow_forward</span>
                </button>

                {/* Summary */}
                {selectedDate && selectedTime && (
                  <div className={`bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-xl p-4 text-sm text-[#6A311D] ${isAr ? 'text-right' : ''}`}>
                    <p className="font-semibold mb-1">{isAr ? 'ملخص الاختيار' : 'Selection Summary'}</p>
                    <p className="text-[#6A311D]/70">{isAr ? (apptType === 'inspection' ? 'معاينة' : 'تركيب') : (apptType === 'inspection' ? 'Inspection' : 'Installation')} · {selectedDate} · {selectedTime}</p>
                  </div>
                )}
              </>
            ) : (
              /* Step 2 — form */
              <div className="bg-white/60 border border-white/50 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-[0_10px_30px_rgba(38,23,12,0.06)]">
                <div className={`flex items-center justify-between mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <h4 className="font-semibold text-[#6A311D] text-base">{isAr ? 'بياناتك' : 'Your Details'}</h4>
                  <button onClick={() => setStep(1)} className="text-xs text-[#6A311D]/50 hover:text-[#d4af37] transition-colors flex items-center gap-1">
                    <span className={`material-symbols-outlined text-sm ${isAr ? '' : 'rotate-180'}`}>arrow_forward</span>
                    {isAr ? 'رجوع' : 'Back'}
                  </button>
                </div>

                <div className="flex flex-col gap-5">
                  {apptType === 'installation' && (
                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37] ${isAr ? 'text-right' : ''}`}>
                        {isAr ? 'نوع الستائر *' : 'Curtain Type *'}
                      </label>
                      <select 
                        value={form.curtainType} 
                        onChange={e => setForm(p => ({ ...p, curtainType: e.target.value }))}
                        className={`bg-transparent border-b border-[#6A311D]/10 pb-3 text-[#6A311D] focus:outline-none focus:border-[#d4af37] transition-colors text-sm ${isAr ? 'text-right' : ''}`}
                      >
                        <option value="">{isAr ? 'اختر النوع' : 'Select Type'}</option>
                        <option value="Roller Blinds">{isAr ? 'ستائر رول' : 'Roller Blinds'}</option>
                        <option value="Zebra Blinds">{isAr ? 'ستائر زيبرا' : 'Zebra Blinds'}</option>
                        <option value="Vertical Blinds">{isAr ? 'ستائر شرائح رأسية' : 'Vertical Blinds'}</option>
                        <option value="Metallic/Wooden Blinds">{isAr ? 'ستائر شرائح معدنية/خشبية' : 'Metallic/Wooden Blinds'}</option>
                        <option value="Double System">{isAr ? 'ستائر دبل سيستم' : 'Double System'}</option>
                        <option value="Printed">{isAr ? 'ستائر مطبوعة' : 'Printed'}</option>
                      </select>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37] ${isAr ? 'text-right' : ''}`}>
                      {isAr ? 'نظام التشغيل' : 'Operation System'}
                    </label>
                    <select 
                      value={form.systemType} 
                      onChange={e => setForm(p => ({ ...p, systemType: e.target.value }))}
                      className={`bg-transparent border-b border-[#6A311D]/10 pb-3 text-[#6A311D] focus:outline-none focus:border-[#d4af37] transition-colors text-sm ${isAr ? 'text-right' : ''}`}
                    >
                      <option value="manual">{isAr ? 'يدوي (Manual)' : 'Manual'}</option>
                      <option value="smart_app">{isAr ? 'تطبيق ذكي (Smart App)' : 'Smart App'}</option>
                      <option value="remote">{isAr ? 'ريموت كنترول (Remote Control)' : 'Remote Control'}</option>
                    </select>
                  </div>

                  {form.systemType !== 'manual' && (
                    <div className="flex flex-col gap-1.5 mb-2">
                      <label className={`text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37] ${isAr ? 'text-right' : ''}`}>
                        {isAr ? 'الماركة (الموتور)' : 'Motor Brand'}
                      </label>
                      <select 
                        value={form.motorBrand} 
                        onChange={e => setForm(p => ({ ...p, motorBrand: e.target.value }))}
                        className={`bg-transparent border-b border-[#6A311D]/10 pb-3 text-[#6A311D] focus:outline-none focus:border-[#d4af37] transition-colors text-sm ${isAr ? 'text-right' : ''}`}
                      >
                        <option value="somfy">{isAr ? 'سومفي (ضمان 10 سنوات)' : 'Somfy (10 Years Warranty)'}</option>
                        <option value="azzaro">{isAr ? 'أزارو (ضمان 5 سنوات)' : 'Azzaro (5 Years Warranty)'}</option>
                      </select>
                      
                      {form.systemType === 'smart_app' && (
                        <p className={`text-xs text-[#6A311D]/80 mt-2 bg-[#d4af37]/20 border border-[#d4af37]/30 p-2.5 rounded-md ${isAr ? 'text-right' : ''}`}>
                          <span className="font-bold text-[#6A311D]">تنبيه:</span> {isAr ? 'تأكد من وجود تأسيس سمارت (Smart Home) في المنزل.' : 'Ensure smart home infrastructure is already set up in your house.'}
                        </p>
                      )}
                      {form.systemType === 'remote' && (
                        <p className={`text-xs text-[#6A311D]/80 mt-2 bg-[#d4af37]/20 border border-[#d4af37]/30 p-2.5 rounded-md ${isAr ? 'text-right' : ''}`}>
                          <span className="font-bold text-[#6A311D]">تنبيه:</span> {isAr ? 'تأكد من توفير وصلة كهرباء (أرضي وكهرباء) بالقرب من الشباك.' : 'Ensure a power connection is available near the window.'}
                        </p>
                      )}
                    </div>
                  )}

                  {[
                    { key: 'name',    label: isAr ? 'الاسم الكامل *' : 'Full Name *',    ph: isAr ? 'اسمك الكامل' : 'Your name',      type: 'text' },
                    { key: 'phone',   label: isAr ? 'رقم الهاتف *' : 'Phone Number *',   ph: '01xxxxxxxxx',                             type: 'tel', dir: 'ltr' },
                    { key: 'address', label: isAr ? 'العنوان' : 'Address',               ph: isAr ? 'عنوانك التفصيلي' : 'Your address', type: 'text' },
                    { key: 'notes',   label: isAr ? 'ملاحظات' : 'Notes',                 ph: isAr ? 'أي تفاصيل إضافية...' : 'Any extra details...', type: 'text' },
                  ].map(f => (
                    <div key={f.key} className="flex flex-col gap-1.5">
                      <label className={`text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37] ${isAr ? 'text-right' : ''}`}>{f.label}</label>
                      <input type={f.type} dir={f.dir} value={form[f.key as keyof typeof form]} placeholder={f.ph}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className={`bg-transparent border-b border-[#6A311D]/10 pb-3 text-[#6A311D] placeholder:text-[#6A311D]/30 focus:outline-none focus:border-[#d4af37] transition-colors text-sm ${isAr ? 'text-right' : ''}`} />
                    </div>
                  ))}

                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                  <button onClick={handleSubmit} disabled={submitting}
                    className="mt-2 py-4 bg-[#C6AB8E] text-[#6A311D] rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-[#3d2b1f] transition-colors disabled:opacity-50 shadow-lg flex items-center justify-center gap-2">
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
