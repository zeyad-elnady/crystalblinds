"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CatalogItem, getStoredCatalogs, saveStoredCatalogs } from "@/lib/catalogs";

const SAMPLE_IMAGES = [
  { label: "ستائر مطبوعة", url: "/photos for crystal/printed_roller.png" },
  { label: "ستائر ذكية", url: "/photos for crystal/hero1.jpeg" },
  { label: "ستائر رول", url: "/photos for crystal/ستائر رول صن سكرين.jpeg" },
  { label: "ستائر خشبية", url: "/photos for crystal/ستائر شرائح خشبيه.jpeg" },
  { label: "ستائر زيبرا", url: "/photos for crystal/ستائر زيبرا.jpeg" },
];

const EMPTY_FORM: Omit<CatalogItem, "id"> = {
  titleAr: "",
  titleEn: "",
  descAr: "",
  descEn: "",
  categoryAr: "الكتالوج العام",
  categoryEn: "General Catalog",
  fileUrl: "",
  coverImage: "/photos for crystal/printed_roller.png",
  fileSize: "1.0 MB",
};

export default function CatalogsView() {
  const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [form, setForm] = useState<Omit<CatalogItem, "id">>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [imageFileToUpload, setImageFileToUpload] = useState<File | null>(null);

  useEffect(() => {
    setCatalogs(getStoredCatalogs());
  }, []);

  const persist = (updated: CatalogItem[]) => {
    setCatalogs(updated);
    saveStoredCatalogs(updated);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFileToUpload(null);
    setImageFileToUpload(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: CatalogItem) => {
    setEditingItem(item);
    const { id, ...rest } = item;
    setForm(rest);
    setFileToUpload(null);
    setImageFileToUpload(null);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileToUpload(file);

      const bytes = file.size;
      const mb = (bytes / (1024 * 1024)).toFixed(1);
      const sizeStr = `${mb} MB`;

      setForm((prev) => ({
        ...prev,
        fileSize: sizeStr,
      }));
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFileToUpload(file);

      // Create preview Data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          coverImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!form.titleAr.trim()) {
      alert("يرجى إدخال عنوان الكتالوج بالعربية");
      return;
    }

    setUploading(true);
    let finalFileUrl = form.fileUrl;
    let finalCoverImage = form.coverImage || "/photos for crystal/printed_roller.png";

    try {
      // 1. Upload Catalog Document File if provided
      if (fileToUpload) {
        const fileExt = fileToUpload.name.split(".").pop();
        const fileName = `catalog_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("catalogs")
          .upload(fileName, fileToUpload, { upsert: true });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from("catalogs")
            .getPublicUrl(data.path);

          if (publicUrlData?.publicUrl) {
            finalFileUrl = publicUrlData.publicUrl;
          }
        } else {
          finalFileUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(fileToUpload);
          });
        }
      }

      // 2. Upload Cover Image File if provided
      if (imageFileToUpload) {
        const imgExt = imageFileToUpload.name.split(".").pop();
        const imgName = `cover_${Date.now()}_${Math.random().toString(36).substring(7)}.${imgExt}`;

        const { data: imgData, error: imgError } = await supabase.storage
          .from("catalogs")
          .upload(imgName, imageFileToUpload, { upsert: true });

        if (!imgError && imgData) {
          const { data: publicUrlData } = supabase.storage
            .from("catalogs")
            .getPublicUrl(imgData.path);

          if (publicUrlData?.publicUrl) {
            finalCoverImage = publicUrlData.publicUrl;
          }
        }
      }

      if (!finalFileUrl) {
        finalFileUrl = "/photos for crystal/printed_roller.png";
      }

      const newItemData: CatalogItem = {
        id: editingItem ? editingItem.id : `cat_${Date.now()}`,
        titleAr: form.titleAr,
        titleEn: form.titleEn || form.titleAr,
        descAr: form.descAr || "",
        descEn: form.descEn || "",
        categoryAr: form.categoryAr || "عام",
        categoryEn: form.categoryEn || "General",
        fileUrl: finalFileUrl,
        coverImage: finalCoverImage,
        fileSize: form.fileSize || "2.0 MB",
        created_at: editingItem?.created_at || new Date().toISOString(),
      };

      if (editingItem) {
        const updated = catalogs.map((item) =>
          item.id === editingItem.id ? newItemData : item
        );
        persist(updated);
      } else {
        const updated = [newItemData, ...catalogs];
        persist(updated);
      }

      setShowModal(false);
    } catch (err) {
      console.error("Error saving catalog:", err);
      alert("حدث خطأ أثناء حفظ الكتالوج");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت تأكد من حذف هذا الكتالوج؟")) {
      const updated = catalogs.filter((c) => c.id !== id);
      persist(updated);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...catalogs];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    persist(updated);
  };

  const moveDown = (index: number) => {
    if (index === catalogs.length - 1) return;
    const updated = [...catalogs];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    persist(updated);
  };

  return (
    <div className="flex flex-col gap-6 text-[#3E2723]" style={{ direction: "rtl" }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div>
          <h2 className="font-bold text-lg">إدارة الكتالوجات (Catalogs)</h2>
          <p className="text-xs text-[#3E2723]/60 mt-1">
            إضافة وتعديل الملفات والصور المتاحة للتحميل في صفحة المنتجات والموقع
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-[#d4af37] text-[#2B1B17] font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-[#b8922a] transition-all shadow-[0_2px_8px_rgba(212,175,55,0.25)]"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>إضافة كتالوج جديد</span>
        </button>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {catalogs.map((item, index) => {
          const cover = item.coverImage || item.fileUrl || "/photos for crystal/printed_roller.png";
          return (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-neutral-100 border border-[#3E2723]/10 overflow-hidden shrink-0">
                    <img
                      src={cover}
                      alt={item.titleAr}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#3E2723]">{item.titleAr}</h3>
                    <span className="text-[11px] text-[#3E2723]/50 block">{item.titleEn}</span>
                    {item.categoryAr && (
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#3E2723]/5 text-[#3E2723]/70">
                        {item.categoryAr}
                      </span>
                    )}
                  </div>
                </div>

                {item.fileSize && (
                  <span className="text-xs text-[#3E2723]/50 font-mono bg-neutral-100 px-2 py-1 rounded">
                    {item.fileSize}
                  </span>
                )}
              </div>

              {item.descAr && (
                <p className="text-xs text-[#3E2723]/70 leading-relaxed bg-[#FAF8F5] p-3 rounded-xl">
                  {item.descAr}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#3E2723]/5">
                {/* Order controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="w-8 h-8 rounded-lg border border-[#3E2723]/10 hover:border-[#d4af37] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                    title="تحريك لأعلى"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === catalogs.length - 1}
                    className="w-8 h-8 rounded-lg border border-[#3E2723]/10 hover:border-[#d4af37] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                    title="تحريك لأسفل"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-[#3E2723]/5 hover:bg-[#3E2723]/10 text-[#3E2723] px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>معاينة</span>
                  </a>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="w-8 h-8 rounded-xl border border-[#3E2723]/10 hover:border-[#d4af37] hover:text-[#d4af37] flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-xl border border-[#3E2723]/10 hover:border-red-500 hover:text-red-500 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDFA] border border-[#d4af37]/30 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-[#3E2723] to-[#5D3A1A] text-white p-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-sm">
                {editingItem ? "تعديل الكتالوج" : "إضافة كتالوج جديد"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#3E2723]/70">
                    عنوان الكتالوج (عربي) *
                  </label>
                  <input
                    type="text"
                    value={form.titleAr}
                    onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                    placeholder="مثال: كتالوج الستائر الذكية 2026"
                    className="border border-[#3E2723]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#3E2723]/70">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={form.titleEn}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    placeholder="e.g. Smart Blinds Catalog 2026"
                    dir="ltr"
                    className="border border-[#3E2723]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#3E2723]/70">
                    القسم (عربي)
                  </label>
                  <input
                    type="text"
                    value={form.categoryAr}
                    onChange={(e) => setForm({ ...form, categoryAr: e.target.value })}
                    placeholder="مثال: ستائر رول"
                    className="border border-[#3E2723]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#3E2723]/70">
                    Category (English)
                  </label>
                  <input
                    type="text"
                    value={form.categoryEn}
                    onChange={(e) => setForm({ ...form, categoryEn: e.target.value })}
                    placeholder="e.g. Roller Blinds"
                    dir="ltr"
                    className="border border-[#3E2723]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Cover Photo Upload & Selection */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#3E2723]/10">
                <label className="text-xs font-bold text-[#3E2723]">
                  صورة غلاف الكتالوج (Catalog Photo / Cover) *
                </label>

                {/* Preview Thumbnail */}
                {form.coverImage && (
                  <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-[#3E2723]/10">
                    <img
                      src={form.coverImage}
                      alt="Cover Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-[#3E2723]/10"
                    />
                    <span className="text-xs text-emerald-700 font-bold">
                      ✓ الصورة المختارة حالياً
                    </span>
                  </div>
                )}

                {/* File Upload Input */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="text-xs text-[#3E2723]/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#3E2723] file:text-white hover:file:bg-[#2B1B17] file:cursor-pointer cursor-pointer"
                />

                {/* Quick Select Sample Photo */}
                <div className="mt-1">
                  <label className="text-[11px] text-[#3E2723]/60 block mb-1.5">
                    أو اختر صورة جاهزة سريعة:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_IMAGES.map((sample, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, coverImage: sample.url }))
                        }
                        className={`flex items-center gap-1.5 p-1 px-2.5 rounded-lg border text-xs transition-all ${
                          form.coverImage === sample.url
                            ? "border-[#d4af37] bg-[#d4af37]/15 font-bold text-[#3E2723]"
                            : "border-[#3E2723]/10 bg-white text-[#3E2723]/70 hover:border-[#3E2723]/30"
                        }`}
                      >
                        <img
                          src={sample.url}
                          alt={sample.label}
                          className="w-5 h-5 rounded object-cover"
                        />
                        <span>{sample.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PDF / Document File Upload */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#FAF8F5] border border-[#3E2723]/10">
                <label className="text-xs font-bold text-[#3E2723]">
                  رفع ملف PDF الخاص بالكتالوج (Document File)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                  onChange={handleFileChange}
                  className="text-xs text-[#3E2723]/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#d4af37] file:text-[#2B1B17] hover:file:bg-[#b8922a] file:cursor-pointer cursor-pointer"
                />
                {fileToUpload && (
                  <span className="text-[11px] text-emerald-700 font-bold">
                    ✓ تم اختيار الملف: {fileToUpload.name} ({form.fileSize})
                  </span>
                )}

                <div className="mt-2 flex flex-col gap-1">
                  <label className="text-[11px] text-[#3E2723]/60">
                    أو ادخل رابط الملف مباشراً (URL):
                  </label>
                  <input
                    type="text"
                    value={form.fileUrl}
                    onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                    placeholder="https://..."
                    dir="ltr"
                    className="border border-[#3E2723]/15 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#3E2723]/70">
                  وصف الكتالوج (عربي)
                </label>
                <textarea
                  value={form.descAr}
                  onChange={(e) => setForm({ ...form, descAr: e.target.value })}
                  placeholder="وصف مختصر لمحتوى الكتالوج..."
                  rows={2}
                  className="border border-[#3E2723]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 justify-end pt-2 border-t border-[#3E2723]/10">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold border border-[#3E2723]/20 rounded-xl hover:bg-[#3E2723]/5"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-[#d4af37] text-[#2B1B17] rounded-xl hover:bg-[#b8922a] disabled:opacity-50"
                >
                  {uploading ? (
                    <span>جاري الحفظ والرفع...</span>
                  ) : (
                    <span>{editingItem ? "حفظ التعديلات" : "إضافة الكتالوج"}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
