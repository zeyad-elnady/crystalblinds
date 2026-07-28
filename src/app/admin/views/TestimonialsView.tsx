"use client";

import { useState, useEffect } from "react";
import { Testimonial, loadTestimonials, saveTestimonials } from "@/app/[locale]/Testimonials";

const EMPTY: Omit<Testimonial, "id"> = {
  nameAr: "",
  nameEn: "",
  locationAr: "",
  locationEn: "",
  textAr: "",
  textEn: "",
  avatar: "",
};

export default function TestimonialsView() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<Omit<Testimonial, "id">>(EMPTY);

  useEffect(() => {
    setItems(loadTestimonials());
  }, []);

  const persist = (list: Testimonial[]) => {
    setItems(list);
    saveTestimonials(list);
  };

  const handleOpen = (item?: Testimonial) => {
    if (item) {
      setEditing(item);
      const { id, ...rest } = item;
      setForm(rest);
    } else {
      setEditing(null);
      setForm(EMPTY);
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY);
  };

  const handleSave = () => {
    if (!form.nameAr.trim() || !form.textAr.trim()) return;
    if (editing) {
      persist(items.map((t) => (t.id === editing.id ? { ...form, id: editing.id } : t)));
    } else {
      persist([...items, { ...form, id: Date.now().toString() }]);
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    if (!confirm("هل تريد حذف هذا التعليق؟")) return;
    persist(items.filter((t) => t.id !== id));
  };

  const moveUp = (i: number) => {
    if (i === 0) return;
    const arr = [...items];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    persist(arr);
  };

  const moveDown = (i: number) => {
    if (i === items.length - 1) return;
    const arr = [...items];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    persist(arr);
  };

  return (
    <div className="flex flex-col gap-6 text-[#3E2723]" style={{ direction: "rtl" }}>
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-sm">
        <div>
          <h2 className="font-bold text-lg">آراء العملاء</h2>
          <p className="text-xs text-[#3E2723]/50 mt-0.5">إدارة تعليقات العملاء المعروضة على الموقع</p>
        </div>
        <button
          onClick={() => handleOpen()}
          className="flex items-center gap-2 bg-[#d4af37] text-[#2B1B17] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#b8922a] transition-all shadow-[0_2px_8px_rgba(212,175,55,0.25)]"
        >
          <span className="material-symbols-outlined text-base">add</span>
          إضافة تعليق
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-[#3E2723]/10 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Quote */}
            <p className="text-sm text-[#3E2723]/70 leading-relaxed line-clamp-3 text-right">
              "{item.textAr}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-3 border-t border-[#3E2723]/6 flex-row-reverse justify-end">
              <div className="flex flex-col text-right">
                <span className="font-bold text-sm text-[#3E2723]">{item.nameAr}</span>
                <span className="text-xs text-[#3E2723]/45">{item.locationAr}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#3E2723]/6 flex items-center justify-center text-[#d4af37] font-bold text-base shrink-0">
                {item.avatar || item.nameAr.charAt(0)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              {/* Reorder */}
              <div className="flex gap-1">
                <button
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#3E2723]/10 hover:border-[#d4af37] hover:text-[#d4af37] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[#3E2723]/60"
                >
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button
                  onClick={() => moveDown(i)}
                  disabled={i === items.length - 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#3E2723]/10 hover:border-[#d4af37] hover:text-[#d4af37] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[#3E2723]/60"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </button>
              </div>

              {/* Edit / Delete */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleOpen(item)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center border border-[#3E2723]/10 hover:border-[#d4af37] hover:text-[#d4af37] transition-all"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center border border-[#3E2723]/10 hover:border-red-400 hover:text-red-500 transition-all"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" dir="rtl">
            <div className="bg-gradient-to-r from-[#3E2723] to-[#5D3A1A] text-white px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-sm">{editing ? "تعديل التعليق" : "إضافة تعليق جديد"}</h3>
              <button onClick={handleClose} className="text-white/60 hover:text-white">✕</button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#3E2723]/60">اسم العميل (عربي)</label>
                  <input
                    value={form.nameAr}
                    onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                    placeholder="أحمد محمود"
                    className="border border-[#3E2723]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#3E2723]/60">Client Name (English)</label>
                  <input
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    placeholder="Ahmed Mahmoud"
                    dir="ltr"
                    className="border border-[#3E2723]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#3E2723]/60">الموقع (عربي)</label>
                  <input
                    value={form.locationAr}
                    onChange={(e) => setForm({ ...form, locationAr: e.target.value })}
                    placeholder="القاهرة"
                    className="border border-[#3E2723]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#3E2723]/60">Location (English)</label>
                  <input
                    value={form.locationEn}
                    onChange={(e) => setForm({ ...form, locationEn: e.target.value })}
                    placeholder="Cairo"
                    dir="ltr"
                    className="border border-[#3E2723]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Avatar letter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#3E2723]/60">حرف الصورة الرمزية (حرف واحد)</label>
                <input
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value.slice(0, 1) })}
                  placeholder="أ"
                  maxLength={1}
                  className="border border-[#3E2723]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37] w-20 text-center text-lg font-bold"
                />
              </div>

              {/* Text Arabic */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#3E2723]/60">نص التعليق (عربي) *</label>
                <textarea
                  value={form.textAr}
                  onChange={(e) => setForm({ ...form, textAr: e.target.value })}
                  placeholder="اكتب التعليق هنا..."
                  rows={3}
                  className="border border-[#3E2723]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              {/* Text English */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#3E2723]/60">Review Text (English)</label>
                <textarea
                  value={form.textEn}
                  onChange={(e) => setForm({ ...form, textEn: e.target.value })}
                  placeholder="Write the review here..."
                  rows={3}
                  dir="ltr"
                  className="border border-[#3E2723]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm border border-[#3E2723]/15 rounded-xl hover:bg-[#3E2723]/5 transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.nameAr.trim() || !form.textAr.trim()}
                  className="px-5 py-2 text-sm bg-[#d4af37] text-[#2B1B17] font-bold rounded-xl hover:bg-[#b8922a] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editing ? "حفظ التعديلات" : "إضافة التعليق"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
