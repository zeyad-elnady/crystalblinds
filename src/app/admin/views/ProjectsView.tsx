"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Project {
  nameAr: string;
  nameEn: string;
  category: string;
  blindAr: string;
  blindEn: string;
  image: string;
  descAr: string;
  descEn: string;
}

interface Category {
  id: string;
  labelAr: string;
  labelEn: string;
}

export default function ProjectsView() {
  const [subTab, setSubTab] = useState<"projects" | "categories">("projects");
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modals state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState<Project>({
    nameAr: "",
    nameEn: "",
    category: "",
    blindAr: "",
    blindEn: "",
    image: "",
    descAr: "",
    descEn: "",
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState<Category>({
    id: "",
    labelAr: "",
    labelEn: "",
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
      if (data.projects) setProjects(data.projects);
    } catch (error) {
      console.error("Error loading projects data:", error);
    } finally {
      setLoading(false);
    }
  };

  const persistData = async (updatedCategories: Category[], updatedProjects: Project[]) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ categories: updatedCategories, projects: updatedProjects }),
      });
      if (res.ok) {
        setCategories(updatedCategories);
        setProjects(updatedProjects);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert("Failed to save changes: " + (errData.error || res.statusText));
      }
    } catch (error) {
      alert("Error saving data: " + (error as any).message);
    } finally {
      setSaving(false);
    }
  };

  // Image Upload handler to Supabase
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("product_images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("product_images")
          .getPublicUrl(fileName);

        setProjectForm((prev) => ({
          ...prev,
          image: publicUrlData.publicUrl,
        }));
      } catch (err) {
        alert("فشل رفع الصورة: " + (err as any).message);
      } finally {
        setUploading(false);
      }
    }
  };

  // Project Actions
  const handleOpenAddProject = () => {
    setEditingProjectIndex(null);
    setProjectForm({
      nameAr: "",
      nameEn: "",
      category: categories[0]?.id || "",
      blindAr: "",
      blindEn: "",
      image: "",
      descAr: "",
      descEn: "",
    });
    setShowProjectModal(true);
  };

  const handleOpenEditProject = (proj: Project, index: number) => {
    setEditingProjectIndex(index);
    setProjectForm({ ...proj });
    setShowProjectModal(true);
  };

  const handleSaveProject = () => {
    if (!projectForm.nameAr || !projectForm.nameEn) {
      alert("يرجى إدخال اسم المشروع بالعربية والإنجليزية");
      return;
    }
    const updated = [...projects];
    if (editingProjectIndex !== null) {
      updated[editingProjectIndex] = projectForm;
    } else {
      updated.push(projectForm);
    }
    persistData(categories, updated);
    setShowProjectModal(false);
  };

  const handleDeleteProject = (index: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المشروع؟")) {
      const updated = projects.filter((_, i) => i !== index);
      persistData(categories, updated);
    }
  };

  // Category Actions
  const handleOpenAddCategory = () => {
    setEditingCategoryIndex(null);
    setCategoryForm({ id: "", labelAr: "", labelEn: "" });
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat: Category, index: number) => {
    setEditingCategoryIndex(index);
    setCategoryForm({ ...cat });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.id || !categoryForm.labelAr || !categoryForm.labelEn) {
      alert("يرجى ملء جميع الحقول للقسم");
      return;
    }
    const updated = [...categories];
    if (editingCategoryIndex !== null) {
      updated[editingCategoryIndex] = categoryForm;
    } else {
      // Check for duplicate ID
      if (updated.some((c) => c.id === categoryForm.id)) {
        alert("معرف القسم مستخدم بالفعل");
        return;
      }
      updated.push(categoryForm);
    }
    persistData(updated, projects);
    setShowCategoryModal(false);
  };

  const handleDeleteCategory = (index: number) => {
    const cat = categories[index];
    if (projects.some((p) => p.category === cat.id)) {
      alert("لا يمكن حذف هذا القسم لأنه يحتوي على مشاريع مرتبطة به");
      return;
    }
    if (confirm("هل أنت متأكد من حذف هذا القسم؟")) {
      const updated = categories.filter((_, i) => i !== index);
      persistData(updated, projects);
    }
  };

  return (
    <div className="p-6 md:p-8 text-[#3E2723] font-sans" dir="rtl">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-[#3E2723]/10 pb-6">
        <div>
          <h1 className="text-2xl font-black">إدارة معرض مشاريعنا</h1>
          <p className="text-xs text-[#3E2723]/60 mt-1">تعديل أقسام ومعرض صور مشاريع الشركة المنفذة</p>
        </div>

        <div className="flex bg-[#3E2723]/5 p-1 rounded-xl gap-1 shrink-0">
          <button
            onClick={() => setSubTab("projects")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              subTab === "projects" ? "bg-[#3E2723] text-white shadow-xs" : "text-[#3E2723]/70 hover:bg-white/50"
            }`}
          >
            المشاريع المنفذة
          </button>
          <button
            onClick={() => setSubTab("categories")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              subTab === "categories" ? "bg-[#3E2723] text-white shadow-xs" : "text-[#3E2723]/70 hover:bg-white/50"
            }`}
          >
            أقسام المشاريع
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-[#3E2723]/10 border-t-[#d4af37] rounded-full animate-spin" />
          <span className="text-xs font-medium text-[#3E2723]/60">جاري تحميل البيانات...</span>
        </div>
      ) : (
        <>
          {/* Projects View */}
          {subTab === "projects" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">كل المشاريع المنفذة ({projects.length})</h2>
                <button
                  onClick={handleOpenAddProject}
                  className="bg-[#3E2723] hover:bg-[#2C1D18] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  إضافة مشروع جديد
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="bg-white border border-[#3E2723]/10 rounded-2xl p-12 text-center text-[#3E2723]/50">
                  <span className="material-symbols-outlined text-4xl mb-2">folder_open</span>
                  <p className="text-sm">لم يتم إضافة أي مشاريع بعد. اضغط على زر الإضافة للبدء!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {projects.map((proj, i) => (
                    <div key={i} className="bg-white border border-[#3E2723]/10 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="relative aspect-video w-full bg-[#3E2723]/5">
                          {proj.image ? (
                            <img src={proj.image} alt={proj.nameAr} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#3E2723]/30">
                              <span className="material-symbols-outlined text-3xl">image</span>
                            </div>
                          )}
                          <span className="absolute top-2.5 right-2.5 bg-[#3E2723]/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {categories.find((c) => c.id === proj.category)?.labelAr || proj.category}
                          </span>
                        </div>

                        <div className="p-4">
                          <h3 className="font-bold text-sm text-[#3E2723]">{proj.nameAr}</h3>
                          <p className="text-[11px] text-[#3E2723]/50 font-semibold mt-0.5">{proj.blindAr}</p>
                          <p className="text-xs text-[#3E2723]/70 font-light mt-2 line-clamp-2 leading-relaxed">{proj.descAr}</p>
                        </div>
                      </div>

                      <div className="p-4 border-t border-[#3E2723]/5 bg-[#FAF8F5]/50 flex gap-2">
                        <button
                          onClick={() => handleOpenEditProject(proj, i)}
                          className="flex-1 bg-white border border-[#3E2723]/15 text-[#3E2723] hover:bg-[#3E2723]/5 font-bold text-xs py-1.5 rounded-lg transition-all"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteProject(i)}
                          className="px-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="حذف"
                        >
                          <span className="material-symbols-outlined text-base align-middle">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categories View */}
          {subTab === "categories" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">أقسام المعرض ({categories.length})</h2>
                <button
                  onClick={handleOpenAddCategory}
                  className="bg-[#3E2723] hover:bg-[#2C1D18] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  إضافة قسم جديد
                </button>
              </div>

              <div className="bg-white border border-[#3E2723]/10 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#3E2723]/10 text-xs font-bold text-[#3E2723]/60">
                      <th className="p-4">اسم القسم بالعربية</th>
                      <th className="p-4">اسم القسم بالإنجليزية</th>
                      <th className="p-4">معرف القسم (ID)</th>
                      <th className="p-4 text-left">التحكم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3E2723]/5 text-xs font-medium">
                    {categories.map((cat, i) => (
                      <tr key={cat.id} className="hover:bg-[#FAF8F5]/30">
                        <td className="p-4 font-bold">{cat.labelAr}</td>
                        <td className="p-4 text-[#3E2723]/70">{cat.labelEn}</td>
                        <td className="p-4 font-mono text-[#3E2723]/60">{cat.id}</td>
                        <td className="p-4 text-left flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditCategory(cat, i)}
                            className="bg-white border border-[#3E2723]/15 text-[#3E2723] hover:bg-[#3E2723]/5 font-bold px-3 py-1.5 rounded-lg transition-all"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(i)}
                            className="border border-red-200 text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-all"
                            title="حذف"
                          >
                            <span className="material-symbols-outlined text-base align-middle">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl border border-[#3E2723]/10">
            <div className="p-5 border-b border-[#3E2723]/10 flex items-center justify-between">
              <h3 className="font-headline text-base font-bold">
                {editingProjectIndex !== null ? "تعديل بيانات المشروع" : "إضافة مشروع جديد"}
              </h3>
              <button onClick={() => setShowProjectModal(false)} className="text-[#3E2723]/50 hover:text-[#3E2723]">✕</button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-right">
              <div>
                <label className="text-[11px] font-bold text-[#3E2723]/60 block mb-1">اسم المشروع (عربي)</label>
                <input
                  type="text"
                  value={projectForm.nameAr}
                  onChange={(e) => setProjectForm({ ...projectForm, nameAr: e.target.value })}
                  placeholder="مثال: فيلا رويال هيلز - التجمع الخامس"
                  className="w-full bg-[#FAF8F5] border border-[#3E2723]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3E2723]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#3E2723]/60 block mb-1">اسم المشروع (En)</label>
                <input
                  type="text"
                  value={projectForm.nameEn}
                  onChange={(e) => setProjectForm({ ...projectForm, nameEn: e.target.value })}
                  placeholder="e.g. Royal Hills Villa - Fifth Settlement"
                  className="w-full bg-[#FAF8F5] border border-[#3E2723]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3E2723] text-left"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-[#3E2723]/60 block mb-1">القسم</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#3E2723]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3E2723]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.labelAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#3E2723]/60 block mb-1">صورة المشروع</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={projectForm.image}
                      onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                      placeholder="رابط الصورة المباشر"
                      className="flex-1 bg-[#FAF8F5] border border-[#3E2723]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3E2723] text-left"
                      dir="ltr"
                    />
                    <label className="bg-[#3E2723] hover:bg-[#2C1D18] text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors flex items-center justify-center">
                      {uploading ? "جاري الرفع..." : "رفع ملف"}
                      <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#3E2723]/60 block mb-1">نوع الستائر المنفذة (عربي)</label>
                <input
                  type="text"
                  value={projectForm.blindAr}
                  onChange={(e) => setProjectForm({ ...projectForm, blindAr: e.target.value })}
                  placeholder="مثال: ستائر دبل سيستم موتورايزد بالكامل"
                  className="w-full bg-[#FAF8F5] border border-[#3E2723]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3E2723]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#3E2723]/60 block mb-1">نوع الستائر المنفذة (En)</label>
                <input
                  type="text"
                  value={projectForm.blindEn}
                  onChange={(e) => setProjectForm({ ...projectForm, blindEn: e.target.value })}
                  placeholder="e.g. Fully Motorized Double System Blinds"
                  className="w-full bg-[#FAF8F5] border border-[#3E2723]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3E2723] text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#3E2723]/60 block mb-1">وصف العمل والتنفيذ (عربي)</label>
                <textarea
                  value={projectForm.descAr}
                  onChange={(e) => setProjectForm({ ...projectForm, descAr: e.target.value })}
                  placeholder="وصف تفصيلي للتركيب والأنظمة المستخدمة..."
                  rows={3}
                  className="w-full bg-[#FAF8F5] border border-[#3E2723]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3E2723] resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#3E2723]/60 block mb-1">وصف العمل والتنفيذ (En)</label>
                <textarea
                  value={projectForm.descEn}
                  onChange={(e) => setProjectForm({ ...projectForm, descEn: e.target.value })}
                  placeholder="Detailed description of works..."
                  rows={3}
                  className="w-full bg-[#FAF8F5] border border-[#3E2723]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3E2723] resize-none text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#3E2723]/10 bg-[#FAF8F5] flex justify-end gap-2">
              <button
                onClick={() => setShowProjectModal(false)}
                className="bg-white border border-[#3E2723]/15 text-[#3E2723] hover:bg-[#3E2723]/5 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveProject}
                disabled={saving}
                className="bg-[#3E2723] hover:bg-[#2C1D18] text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors shadow-sm"
              >
                {saving ? "جاري الحفظ..." : "حفظ البيانات"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-[#3E2723]/10">
            <div className="p-5 border-b border-[#3E2723]/10 flex items-center justify-between">
              <h3 className="font-headline text-base font-bold">
                {editingCategoryIndex !== null ? "تعديل بيانات القسم" : "إضافة قسم جديد"}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-[#3E2723]/50 hover:text-[#3E2723]">✕</button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-right">
              <div>
                <label className="text-[11px] font-bold text-[#3E2723]/60 block mb-1">اسم القسم (عربي)</label>
                <input
                  type="text"
                  value={categoryForm.labelAr}
                  onChange={(e) => setCategoryForm({ ...categoryForm, labelAr: e.target.value })}
                  placeholder="مثال: فيلات سكنية"
                  className="w-full bg-[#FAF8F5] border border-[#3E2723]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3E2723]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#3E2723]/60 block mb-1">اسم القسم (En)</label>
                <input
                  type="text"
                  value={categoryForm.labelEn}
                  onChange={(e) => setCategoryForm({ ...categoryForm, labelEn: e.target.value })}
                  placeholder="e.g. Villas"
                  className="w-full bg-[#FAF8F5] border border-[#3E2723]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3E2723] text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#3E2723]/60 block mb-1">معرف القسم (ID - بالإنجليزية فقط)</label>
                <input
                  type="text"
                  value={categoryForm.id}
                  disabled={editingCategoryIndex !== null}
                  onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value.replace(/[^a-zA-Z]/g, "") })}
                  placeholder="e.g. Villa"
                  className="w-full bg-[#FAF8F5] border border-[#3E2723]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3E2723] text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#3E2723]/10 bg-[#FAF8F5] flex justify-end gap-2">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="bg-white border border-[#3E2723]/15 text-[#3E2723] hover:bg-[#3E2723]/5 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={saving}
                className="bg-[#3E2723] hover:bg-[#2C1D18] text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors shadow-sm"
              >
                {saving ? "جاري الحفظ..." : "حفظ القسم"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
