"use client";

import React, { useState } from 'react';
import { submitContactMessage } from '@/lib/messages';
import { isValidEgyptianPhone, sanitizePhoneInput } from '@/lib/validation';

export default function ContactForm({ isAr }: { isAr: boolean }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError(isAr ? 'يرجى ملء جميع الحقول المطلوبة (*)' : 'Please fill in all required fields (*)');
      return;
    }

    if (!isValidEgyptianPhone(phone.trim())) {
      setError(isAr ? 'يرجى إدخال رقم هاتف مصري صحيح (11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015)' : 'Please enter a valid 11-digit Egyptian phone number (e.g. 01012345678)');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await submitContactMessage({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        message: message.trim(),
      });

      if (res.success) {
        setSuccess(true);
        setName('');
        setPhone('');
        setEmail('');
        setMessage('');
      } else {
        setError(res.error || (isAr ? 'حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة لاحقاً.' : 'Failed to send message, please try again later.'));
      }
    } catch (err: any) {
      setError(err.message || (isAr ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#065f46] p-4 rounded-2xl text-sm text-center font-medium transition-all shadow-sm">
          {isAr ? 'شكراً لتواصلك معنا! تم إرسال رسالتك بنجاح وسيتواصل معك فريقنا قريباً.' : 'Thank you! Your message has been sent successfully and our team will contact you soon.'}
        </div>
      )}
      
      {error && (
        <div className="bg-[#fff5f5] border border-[#fecaca] text-[#b91c1c] p-4 rounded-2xl text-sm text-center font-medium transition-all shadow-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="cname" className="text-xs font-bold text-[#3E2723]/70">
            {isAr ? 'الاسم الكامل *' : 'Full Name *'}
          </label>
          <input 
            type="text" 
            id="cname" 
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={isAr ? 'أدخل اسمك الكامل' : 'Your full name'}
            className="w-full bg-[#FFFDFA] border border-[#3E2723]/15 rounded-xl px-4 py-3 text-[#3E2723] placeholder:text-[#3E2723]/30 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/15 transition-all text-sm" 
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="cphone" className="text-xs font-bold text-[#3E2723]/70">
            {isAr ? 'رقم الهاتف *' : 'Phone Number *'}
          </label>
          <input 
            type="tel" 
            id="cphone" 
            required
            value={phone}
            maxLength={15}
            onChange={e => setPhone(sanitizePhoneInput(e.target.value))}
            dir="ltr" 
            placeholder="01xxxxxxxxx"
            className="w-full bg-[#FFFDFA] border border-[#3E2723]/15 rounded-xl px-4 py-3 text-[#3E2723] placeholder:text-[#3E2723]/30 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/15 transition-all text-sm" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="cemail" className="text-xs font-bold text-[#3E2723]/70">
          {isAr ? 'البريد الإلكتروني (اختياري)' : 'Email Address (Optional)'}
        </label>
        <input 
          type="email" 
          id="cemail" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          dir="ltr" 
          placeholder="name@example.com"
          className="w-full bg-[#FFFDFA] border border-[#3E2723]/15 rounded-xl px-4 py-3 text-[#3E2723] placeholder:text-[#3E2723]/30 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/15 transition-all text-sm" 
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="cmsg" className="text-xs font-bold text-[#3E2723]/70">
          {isAr ? 'تفاصيل الرسالة أو الطلب *' : 'Message Details *'}
        </label>
        <textarea 
          id="cmsg" 
          rows={4} 
          required
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={isAr ? 'أخبرنا عن المساحة أو نوع الستائر التي تفضلها أو استفسارك...' : 'Tell us about your space, curtain preferences, or questions...'}
          className="w-full bg-[#FFFDFA] border border-[#3E2723]/15 rounded-xl px-4 py-3 text-[#3E2723] placeholder:text-[#3E2723]/30 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/15 transition-all text-sm resize-none" 
        />
      </div>
      
      <div className="pt-2">
        <button 
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-3 bg-[#3E2723] hover:bg-[#2C1D18] text-white py-4 rounded-xl font-bold tracking-wider text-sm transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
        >
          <span>{submitting ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال الرسالة' : 'Send Message')}</span>
          <span className={`material-symbols-outlined text-[18px] text-[#d4af37] ${isAr ? 'rotate-180' : ''}`}>send</span>
        </button>
      </div>
      
      <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#3E2723]/10 text-xs text-[#3E2723]/60">
        <span>{isAr ? 'تحتاج استجابة فورية؟' : 'Need instant assistance?'}</span>
        <a 
          href="https://wa.me/201100080609"
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-bold text-[#25D366] hover:underline"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-3.5 h-3.5" alt="WhatsApp" />
          {isAr ? 'محادثة واتساب' : 'WhatsApp Chat'}
        </a>
      </div>
    </form>
  );
}
