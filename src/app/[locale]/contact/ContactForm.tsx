"use client";

import React, { useState } from 'react';
import { submitContactMessage } from '@/lib/messages';

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {success && (
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#065f46] p-4 rounded-xl text-sm text-center font-semibold transition-all">
          {isAr ? 'شكراً لتواصلك معنا! تم إرسال رسالتك بنجاح وسيتواصل معك فريقنا قريباً.' : 'Thank you! Your message has been sent successfully and our team will contact you soon.'}
        </div>
      )}
      
      {error && (
        <div className="bg-[#fff5f5] border border-[#fecaca] text-[#b91c1c] p-4 rounded-xl text-sm text-center font-semibold transition-all">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="cname" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
          {isAr ? 'الاسم الكامل *' : 'Full Name *'}
        </label>
        <input 
          type="text" 
          id="cname" 
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={isAr ? 'أدخل اسمك الكامل' : 'Your full name'}
          className="bg-transparent border-b border-[#3E2723]/10 pb-3 text-[#3E2723] placeholder:text-[#3E2723]/30 focus:outline-none focus:border-[#d4af37] transition-colors text-sm" 
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="cphone" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
          {isAr ? 'رقم الهاتف *' : 'Phone Number *'}
        </label>
        <input 
          type="tel" 
          id="cphone" 
          required
          value={phone}
          onChange={e => setPhone(e.target.value)}
          dir="ltr" 
          placeholder="+20 1X XXXX XXXX"
          className="bg-transparent border-b border-[#3E2723]/10 pb-3 text-[#3E2723] placeholder:text-[#3E2723]/30 focus:outline-none focus:border-[#d4af37] transition-colors text-sm" 
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="cemail" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
          {isAr ? 'البريد الإلكتروني' : 'Email Address'}
        </label>
        <input 
          type="email" 
          id="cemail" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          dir="ltr" 
          placeholder="email@example.com"
          className="bg-transparent border-b border-[#3E2723]/10 pb-3 text-[#3E2723] placeholder:text-[#3E2723]/30 focus:outline-none focus:border-[#d4af37] transition-colors text-sm" 
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="cmsg" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
          {isAr ? 'رسالتك *' : 'Your Message *'}
        </label>
        <textarea 
          id="cmsg" 
          rows={4} 
          required
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={isAr ? 'أخبرنا عن مشروعك...' : 'Tell us about your space and vision...'}
          className="bg-transparent border-b border-[#3E2723]/10 pb-3 text-[#3E2723] placeholder:text-[#3E2723]/30 focus:outline-none focus:border-[#d4af37] transition-colors text-sm resize-none" 
        />
      </div>
      
      <button 
        type="submit"
        disabled={submitting}
        className="mt-4 flex items-center justify-center gap-3 bg-[#3E2723] text-white py-4 rounded font-bold tracking-widest uppercase text-xs hover:bg-[#d4af37] transition-colors shadow-lg disabled:opacity-50 cursor-pointer"
      >
        <span>{submitting ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال الرسالة' : 'Send Message')}</span>
        <span className={`material-symbols-outlined text-[16px] ${isAr ? 'rotate-180' : ''}`}>send</span>
      </button>
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
        <span style={{ fontSize: '11px', color: '#6b7280' }}>{isAr ? 'أو تواصل معنا فوراً عبر واتساب:' : 'Or chat with us instantly on WhatsApp:'}</span>
        <a 
          href="https://wa.me/201100080609"
          target="_blank" 
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#25D366', fontWeight: 'bold', fontSize: '11px' }}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" style={{ width: '14px', height: '14px' }} alt="WA" />
          واتساب
        </a>
      </div>
    </form>
  );
}
