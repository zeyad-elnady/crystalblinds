export interface Product {
  id: string;
  images: string[];
  alt: string;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  detailsEn: string;
  detailsAr: string;
  category: string;
  price: number;
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    images: [
      "/photos for crystal/ستائر رول بلاك أوت.jpeg",
      "/photos for crystal/1.jpeg",
      "/photos for crystal/3.jpeg",
    ],
    alt: "Blackout Roller Blinds",
    labelEn: "Blackout Roller Blinds",
    labelAr: "ستائر رول بلاك أوت",
    descEn: "Absolute Light & Heat Insulation",
    descAr: "عزل مطلق للضوء والحرارة",
    detailsEn: "Crafted to completely block out sunlight and UV rays, ensuring maximum privacy and a restful environment anytime.",
    detailsAr: "مصممة لحجب أشعة الشمس والأشعة فوق البنفسجية بالكامل، مما يضمن أقصى درجات الخصوصية وبيئة مريحة في أي وقت.",
    category: "Roller",
    price: 1450,
  },
  {
    id: "2",
    images: [
      "/photos for crystal/ستائر رول صن سكرين.jpeg",
      "/photos for crystal/2.jpeg",
      "/photos for crystal/4.jpeg",
    ],
    alt: "Sunscreen Roller Blinds",
    labelEn: "Sunscreen Roller Blinds",
    labelAr: "ستائر رول صن سكرين",
    descEn: "Smart Protection & Natural Light",
    descAr: "حماية ذكية وإضاءة طبيعية",
    detailsEn: "Allows you to maintain your view while reducing glare and heat, perfect for living spaces that need natural lighting.",
    detailsAr: "تسمح لك بالحفاظ على الرؤية مع تقليل الوهج والحرارة، مثالية لمساحات المعيشة التي تحتاج إلى إضاءة طبيعية.",
    category: "Roller",
    price: 1300,
  },
  {
    id: "3",
    images: [
      "/photos for crystal/ستائر شرائح راسيه.jpeg",
      "/photos for crystal/3.jpeg",
      "/photos for crystal/1.jpeg",
    ],
    alt: "Vertical Blinds",
    labelEn: "Vertical Blinds",
    labelAr: "ستائر شرائح رأسية",
    descEn: "Flexible Control for Wide Spaces",
    descAr: "تحكم مرن للمساحات الواسعة",
    detailsEn: "Ideal for large windows and sliding doors, offering excellent light control and a sleek, contemporary appearance.",
    detailsAr: "مثالية للنوافذ الكبيرة والأبواب المنزلقة، توفر تحكماً ممتازاً في الإضاءة ومظهراً عصرياً وأنيقاً.",
    category: "Classic",
    price: 1100,
  },
  {
    id: "4",
    images: [
      "/photos for crystal/ستائر زيبرا.jpeg",
      "/photos for crystal/4.jpeg",
      "/photos for crystal/2.jpeg",
    ],
    alt: "Zebra Blinds",
    labelEn: "Zebra Blinds",
    labelAr: "ستائر زيبرا",
    descEn: "Modern Graduated Design",
    descAr: "تصميم عصري متدرج",
    detailsEn: "Features alternating sheer and solid fabric bands, giving you flexible control over light filtering and privacy in one brilliant design.",
    detailsAr: "تتميز بأشرطة قماشية شفافة وصلبة متناوبة، مما يمنحك تحكماً مرناً في ترشيح الضوء والخصوصية في تصميم واحد رائع.",
    category: "Modern",
    price: 1650,
  },
  {
    id: "5",
    images: [
      "/photos for crystal/ستائر شرائح معدنية.jpeg",
      "/photos for crystal/1.jpeg",
      "/photos for crystal/4.jpeg",
    ],
    alt: "Metallic Blinds",
    labelEn: "Metallic/Wooden Blinds",
    labelAr: "ستائر شرائح معدنية/خشبية",
    descEn: "Durability & Luxury for Every Taste",
    descAr: "متانة وفخامة لكل ذوق",
    detailsEn: "Engineered for longevity and style, these blinds offer a timeless look with effortless adjustability for any modern interior.",
    detailsAr: "مصممة لتدوم وتتميز بالأناقة، تقدم هذه الستائر مظهراً خالداً مع إمكانية تعديل سهلة لأي تصميم داخلي حديث.",
    category: "Classic",
    price: 1850,
  },
  {
    id: "6",
    images: [
      "/photos for crystal/ستائر دبل سيستم.jpeg",
      "/photos for crystal/3.jpeg",
      "/photos for crystal/2.jpeg",
    ],
    alt: "Double System Blinds",
    labelEn: "Double System Blinds",
    labelAr: "ستائر دبل سيستم",
    descEn: "Dual Intelligence & Unlimited Possibilities",
    descAr: "ذكاء مزدوج وإمكانيات غير محدودة",
    detailsEn: "A revolutionary design combining two distinct blinds in a single system, allowing seamless transition between sheer daytime elegance and nighttime privacy.",
    detailsAr: "تصميم ثوري يجمع بين ستارتين مختلفتين في نظام واحد، مما يسمح بالانتقال السلس بين أناقة النهار الشفافة وخصوصية الليل.",
    category: "Modern",
    price: 2100,
  },
  {
    id: "7",
    images: [
      "/photos for crystal/printed_roller.png",
      "/photos for crystal/2.jpeg",
      "/photos for crystal/4.jpeg",
    ],
    alt: "Printed Roller Blinds",
    labelEn: "Printed Roller Blinds",
    labelAr: "ستائر رول مطبوعه",
    descEn: "Custom Designs & Patterns",
    descAr: "تصاميم ونقوش مخصصة",
    detailsEn: "Add a personalized touch to your space with our premium printed roller blinds, featuring high-quality customized patterns and UV-resistant prints.",
    detailsAr: "أضف لمسة شخصية لمساحتك مع ستائر الرول المطبوعة الفاخرة، تتميز بنقوش مخصصة عالية الجودة وطباعة مقاومة للأشعة فوق البنفسجية.",
    category: "Printed",
    price: 1550,
  },
  {
    id: "8",
    images: [
      "/photos for crystal/hospital_curtain.png",
      "/photos for crystal/1.jpeg",
      "/photos for crystal/3.jpeg",
    ],
    alt: "Bed Dividing Curtains",
    labelEn: "Bed Dividing Curtains",
    labelAr: "ستائر بين اسره",
    descEn: "Professional Privacy Solutions",
    descAr: "حلول احترافية للخصوصية",
    detailsEn: "Professional-grade dividing curtains for hospitals and clinics. Designed for ultimate privacy, easy maintenance, and smooth track operation.",
    detailsAr: "ستائر فواصل احترافية للمستشفيات والعيادات. مصممة لتوفير أقصى درجات الخصوصية، سهولة الصيانة، وحركة سلسة على المجرى.",
    category: "Medical",
    price: 1200,
  },
];
