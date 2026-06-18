"use client";

import { useState } from "react";

interface Project {
  nameAr: string;
  nameEn: string;
  category: "Villa" | "Apartment" | "Office" | "Clinic" | "Mall";
  blindAr: string;
  blindEn: string;
  image: string;
}

const CATEGORIES = [
  { id: "All", labelAr: "الكل", labelEn: "All" },
  { id: "Villa", labelAr: "فيلا سكنية", labelEn: "Villa" },
  { id: "Apartment", labelAr: "شقة سكنية", labelEn: "Apartment" },
  { id: "Office", labelAr: "مكاتب إدارية", labelEn: "Administrative Offices" },
  { id: "Clinic", labelAr: "عيادات طبية", labelEn: "Clinics" },
  { id: "Mall", labelAr: "مراكز تجارية", labelEn: "Commercial Malls" },
];

export default function ExecutedProjects({ isAr }: { isAr: boolean }) {
  const [activeTab, setActiveTab] = useState<string>("All");

  const projects: Project[] = [
    {
      nameAr: "شقة سكنية التجمع",
      nameEn: "Residential Apartment",
      category: "Apartment",
      blindAr: "ستائر رول صن سكرين",
      blindEn: "Sunscreen Roller Blinds",
      image: "/photos for crystal/2.jpeg",
    },
    {
      nameAr: "فيلا سكنية رويال هيلز",
      nameEn: "Luxury Villa",
      category: "Villa",
      blindAr: "ستائر دبل سيستم موتورايزد",
      blindEn: "Motorized Double System Blinds",
      image: "/photos for crystal/3.jpeg",
    },
    {
      nameAr: "مكاتب شركة إدارية",
      nameEn: "Administrative Offices",
      category: "Office",
      blindAr: "ستائر رول بلاك أوت عازل للحرارة",
      blindEn: "Blackout Roller Blinds",
      image: "/photos for crystal/ستائر رول بلاك أوت.jpeg",
    },
    {
      nameAr: "عيادة MAS التخصصية",
      nameEn: "MAS Speciality Clinic",
      category: "Clinic",
      blindAr: "ستائر رول وحواجز غرف طبية",
      blindEn: "Medical Dividers & Roller Blinds",
      image: "/photos for crystal/hospital_curtain.png",
    },
    {
      nameAr: "مول تجاري (Via Mall)",
      nameEn: "Via Commercial Mall",
      category: "Mall",
      blindAr: "ستائر زيبرا كلاسيك",
      blindEn: "Zebra Blinds",
      image: "/photos for crystal/ستائر زيبرا.jpeg",
    },
  ];

  const filteredProjects =
    activeTab === "All"
      ? projects
      : projects.filter((p) => p.category === activeTab);

  return (
    <section id="projects" className="py-24 px-6 md:px-12 bg-[#FFFDFA] text-[#3E2723]">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-semibold">
            {isAr ? "أعمالنا المنفذة" : "PORTFOLIO"}
          </span>
          <h2 className="font-headline text-3xl md:text-5xl font-bold text-[#3E2723] mt-2">
            {isAr ? "نفخر بثقة عملائنا" : "We Take Pride in Our Clients' Trust"}
          </h2>
          <div className="w-16 h-[2px] bg-[#d4af37] mx-auto mt-4" />
        </div>

        {/* Filter Categories Tabs */}
        <div
          className={`flex flex-wrap items-center justify-center gap-3 mb-12 ${
            isAr ? "flex-row-reverse" : ""
          }`}
        >
          {CATEGORIES.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-[#3E2723] border-[#3E2723] text-white shadow-md"
                  : "bg-white border-[#3E2723]/10 text-[#3E2723]/70 hover:border-[#d4af37] hover:text-[#d4af37]"
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Grid of Projects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredProjects.map((proj, i) => (
            <div
              key={i}
              className="group flex flex-col bg-white border border-[#3E2723]/10 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(62,39,35,0.02)] hover:shadow-[0_20px_40px_rgba(62,39,35,0.06)] hover:border-[#d4af37]/30 transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0">
                <img
                  src={proj.image}
                  alt={isAr ? proj.nameAr : proj.nameEn}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
              </div>

              {/* Card content */}
              <div className={`p-5 flex flex-col justify-between flex-1 ${isAr ? "items-start text-right" : "items-start text-left"}`}>
                <div>
                  <h4 className="text-base font-bold text-[#3E2723] mb-1.5 transition-colors duration-300 group-hover:text-[#d4af37]">
                    {isAr ? proj.nameAr : proj.nameEn}
                  </h4>
                  <p className="text-xs text-[#3E2723]/60 font-light mt-0.5">
                    {isAr ? proj.blindAr : proj.blindEn}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
