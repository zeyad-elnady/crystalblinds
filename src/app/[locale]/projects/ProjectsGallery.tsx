"use client";

import { useState, useEffect } from "react";

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

const DEFAULT_CATEGORIES: Category[] = [
  { id: "Villa", labelAr: "فيلات سكنية", labelEn: "Villas" },
  { id: "Apartment", labelAr: "شقق سكنية", labelEn: "Apartments" },
  { id: "Office", labelAr: "مكاتب إدارية", labelEn: "Offices" },
  { id: "Clinic", labelAr: "عيادات طبية", labelEn: "Clinics" },
  { id: "Mall", labelAr: "مراكز تجارية", labelEn: "Malls" },
  { id: "Bespoke", labelAr: "تصاميم خاصة", labelEn: "Bespoke" },
];

const DEFAULT_PROJECTS: Project[] = [
  {
    nameAr: "فيلا رويال هيلز - التجمع الخامس",
    nameEn: "Royal Hills Villa - Fifth Settlement",
    category: "Villa",
    blindAr: "ستائر دبل سيستم موتورايزد بالكامل",
    blindEn: "Fully Motorized Double System Blinds",
    image: "/photos for crystal/3.jpeg",
    descAr: "تكامل تام بين ستائر الشيفون الرقيقة والبلاك أوت المعتم، تحكم لاسلكي ذكي عبر الريموت كونترول وأنظمة المنزل الذكي.",
    descEn: "Seamless integration between sheer curtains and blackout blinds, controlled wirelessly via remote controls and smart home automation."
  },
  {
    nameAr: "شقة سكنية - التجمع الخامس",
    nameEn: "Residential Apartment - Fifth Settlement",
    category: "Apartment",
    blindAr: "ستائر رول صن سكرين عازلة للحرارة",
    blindEn: "Heat-Isolating Sunscreen Roller Blinds",
    image: "/photos for crystal/2.jpeg",
    descAr: "حماية مثالية من أشعة الشمس المباشرة والأشعة فوق البنفسجية مع الحفاظ على الرؤية الخارجية والإضاءة الطبيعية المريحة.",
    descEn: "Perfect protection from direct sunlight and UV rays while retaining the exterior views and comfortable natural light."
  },
  {
    nameAr: "المكاتب الرئيسية لشركة مالية",
    nameEn: "Financial Corporation Headquarters",
    category: "Office",
    blindAr: "ستائر رول بلاك أوت مقاومة للحريق",
    blindEn: "Fire-Resistant Blackout Roller Blinds",
    image: "/photos for crystal/ستائر رول بلاك أوت.jpeg",
    descAr: "تغطية النوافذ الزجاجية العملاقة بنظام رول معتم وعازل تماماً للضوء والحرارة، مصمم خصيصاً للمكاتب وقاعات الاجتماعات.",
    descEn: "Gigantic glass window treatments using 100% blackout fabrics that isolate light and heat, designed specifically for corporate meeting rooms."
  },
  {
    nameAr: "عيادة MAS التخصصية",
    nameEn: "MAS Specialty Clinic",
    category: "Clinic",
    blindAr: "ستائر رول مضادة للبكتيريا وحواجز غرف",
    blindEn: "Anti-Bacterial Roller Blinds & Dividers",
    image: "/photos for crystal/hospital_curtain.png",
    descAr: "توريد وتركيب ستائر رول مقاومة للبكتيريا وسهلة التعقيم، بالإضافة إلى حواجز الأسرة الطبية بأعلى معايير السلامة والنظافة.",
    descEn: "Supply and professional installation of anti-bacterial, easy-to-sanitize roller blinds and medical bed dividers meeting top safety and hygiene standards."
  },
  {
    nameAr: "مول تجاري (Via Mall) - الشروق",
    nameEn: "Via Commercial Mall - El Shorouk",
    category: "Mall",
    blindAr: "ستائر زيبرا كلاسيك بنظام يدوي سلس",
    blindEn: "Classic Zebra Blinds with Manual Control",
    image: "/photos for crystal/ستائر زيبرا.jpeg",
    descAr: "تصميم أنيق يسمح بالتبديل المرن بين الضوء والخصوصية، مثالي للمحلات التجارية والواجهات المطلة على ساحة المول.",
    descEn: "Elegant double-layered style that allows flexible adjustment of light and privacy, ideal for shops and facades overlooking the mall square."
  },
  {
    nameAr: "فيلا سكنية - لوتس ريزيدنس",
    nameEn: "Residential Villa - Lotus Residence",
    category: "Villa",
    blindAr: "ستائر رول مطبوعة وتصميمات مودرن",
    blindEn: "Printed Roller Blinds & Modern Designs",
    image: "/photos for crystal/printed_roller.png",
    descAr: "تخصيص كامل للنوافذ عبر طباعة أنماط هندسية ومناظر طبيعية بجودة عالية متناسقة مع ألوان الأثاث والديكور.",
    descEn: "Complete window personalization with high-resolution printing of custom geometric patterns matching the interior furniture."
  },
  {
    nameAr: "فيلا كمبوند بالم هيلز",
    nameEn: "Palm Hills Villa compound",
    category: "Villa",
    blindAr: "ستائر دبل سيستم يدوية فاخرة",
    blindEn: "Premium Manual Double System Blinds",
    image: "/photos for crystal/ستائر دبل سيستم.jpeg",
    descAr: "حل اقتصادي وممتاز يجمع بين الصن سكرين للحماية النهارية والبلاك أوت للخصوصية الليلية التامة بنظام سلس وسهل الاستخدام.",
    descEn: "An excellent dual treatment combining sunscreen for daytime glare protection and blackout for absolute night-time privacy."
  },
  {
    nameAr: "قاعة مؤتمرات VIP - العاصمة الإدارية",
    nameEn: "VIP Conference Hall - New Capital",
    category: "Bespoke",
    blindAr: "ستائر موتورايزد ذكية للتحكم بالمسرح وقاعات العرض",
    blindEn: "Smart Motorized Blinds for Presentation Halls",
    image: "/hero_bg.png",
    descAr: "تجهيز القاعة بالكامل بستائر تعتيم ذكية تفتح وتغلق أوتوماتيكياً بمجرد بدء عرض شاشات البروجيكتور التفاعلية.",
    descEn: "Equipped the presentation space with smart automation blackout screens that adjust in sync with projector screens and AV systems."
  }
];

export default function ProjectsGallery({ isAr }: { isAr: boolean }) {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
        }
      })
      .catch((err) => console.error("Error fetching projects:", err))
      .finally(() => setLoading(false));
  }, []);

  const allCategories = [{ id: "All", labelAr: "الكل", labelEn: "All" }, ...categories];

  const filteredProjects =
    activeTab === "All"
      ? projects
      : projects.filter((p) => p.category === activeTab);

  return (
    <div className={`w-full ${isAr ? "rtl" : ""}`}>
      {/* Category Tabs */}
      <div
        className={`flex flex-wrap items-center justify-center gap-3 mb-16 ${
          isAr ? "flex-row-reverse" : ""
        }`}
      >
        {allCategories.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-[#3E2723] border-[#3E2723] text-white shadow-lg scale-105"
                : "bg-white border-[#3E2723]/10 text-[#3E2723]/70 hover:border-[#d4af37] hover:text-[#d4af37]"
            }`}
          >
            {isAr ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProjects.map((proj, i) => (
          <div
            key={i}
            className="group flex flex-col bg-white border border-[#3E2723]/10 rounded-2xl overflow-hidden shadow-[0_10px_35px_rgba(62,39,35,0.02)] hover:shadow-[0_25px_50px_rgba(62,39,35,0.08)] hover:border-[#d4af37]/40 transition-all duration-500"
          >
            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0">
              <img
                src={proj.image}
                alt={isAr ? proj.nameAr : proj.nameEn}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <span className="text-[#d4af37] text-[10px] uppercase font-bold tracking-widest block mb-1">
                  {categories.find(c => c.id === proj.category)?.labelAr && (
                    isAr 
                      ? categories.find(c => c.id === proj.category)?.labelAr 
                      : categories.find(c => c.id === proj.category)?.labelEn
                  )}
                </span>
                <h3 className="text-lg font-bold text-[#3E2723] mb-2 transition-colors duration-300 group-hover:text-[#d4af37]">
                  {isAr ? proj.nameAr : proj.nameEn}
                </h3>
                <p className="text-[11px] font-semibold text-[#3E2723]/50 mb-3 border-b border-[#3E2723]/10 pb-3" dir={isAr ? "rtl" : "ltr"}>
                  {isAr ? proj.blindAr : proj.blindEn}
                </p>
                <p className="text-xs text-[#3E2723]/70 font-light leading-relaxed">
                  {isAr ? proj.descAr : proj.descEn}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-20 text-[#3E2723]/50">
          <span className="material-symbols-outlined text-5xl mb-4">folder_open</span>
          <p className="text-base font-light">
            {isAr ? "لا توجد مشاريع مضافة في هذا القسم حالياً." : "No projects found in this category yet."}
          </p>
        </div>
      )}
    </div>
  );
}
