import { supabase } from './supabase';

export interface ProductColor {
  id: string;
  nameEn: string;
  nameAr: string;
  hex: string;
  isSoldOut: boolean;
  image?: string;
}

export interface ProductCategory {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  sort_order: number;
}

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
  is_active: boolean;
  colors: ProductColor[];
}

export async function getCategories(): Promise<ProductCategory[]> {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      nameAr: row.name_ar,
      nameEn: row.name_en,
      sort_order: row.sort_order || 0,
    }));
  } catch (err) {
    console.error('Unexpected error fetching categories:', err);
    return [];
  }
}

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'z11648-v3',
    images: [
      '/photos for crystal/1.jpeg',
      '/photos for crystal/ستائر زيبرا.jpeg',
      '/photos for crystal/hero3.jpeg',
      '/photos for crystal/3.jpeg'
    ],
    alt: 'Zebra Blinds Z11648-V3',
    labelEn: 'Zebra Blinds Z11648-V3',
    labelAr: 'ستائر زيبرا Z11648-V3',
    descEn: 'Get in control with a modern look complemented by precise light management',
    descAr: 'تحكم دقيق في الإضاءة والخصوصية بمظهر عصري فاخر',
    detailsEn: 'Premium dual-layer zebra blinds with smooth chain mechanism.',
    detailsAr: 'ستائر زيبرا طبقتين بنسيج فاخر وآلية تحكم سلاسية.',
    category: 'Zebra',
    price: 2396,
    is_active: true,
    colors: [
      { id: 'c1', nameEn: 'Beige', nameAr: 'بيج', hex: '#D4C4A8', isSoldOut: false },
      { id: 'c2', nameEn: 'Cream', nameAr: 'كريمي', hex: '#F5F2EB', isSoldOut: false }
    ]
  },
  {
    id: 'z11648-v6',
    images: [
      '/photos for crystal/2.jpeg',
      '/photos for crystal/ستائر زيبرا.jpeg',
      '/photos for crystal/4.jpeg',
      '/photos for crystal/hero1.jpeg'
    ],
    alt: 'Zebra Blinds Z11648-V6',
    labelEn: 'Zebra Blinds Z11648-V6',
    labelAr: 'ستائر زيبرا Z11648-V6',
    descEn: 'Modern dark tone graduated design for elegant living spaces',
    descAr: 'تصميم عصري متدرج بلون داكن مميز للمساحات الأنيقة',
    detailsEn: 'Durable polyester weave with light filtering stripes.',
    detailsAr: 'نسيج بوليستر متين مع شرائح مصفاة للضوء.',
    category: 'Zebra',
    price: 2396,
    is_active: true,
    colors: [
      { id: 'c3', nameEn: 'Navy Blue', nameAr: 'كحلي', hex: '#1E293B', isSoldOut: false },
      { id: 'c4', nameEn: 'Grey', nameAr: 'رمادي', hex: '#64748B', isSoldOut: false }
    ]
  },
  {
    id: 'z298-812',
    images: [
      '/photos for crystal/3.jpeg',
      '/photos for crystal/ستائر زيبرا.jpeg',
      '/photos for crystal/1.jpeg',
      '/photos for crystal/hero2.jpeg'
    ],
    alt: 'Zebra Blinds Z298-812',
    labelEn: 'Zebra Blinds Z298-812',
    labelAr: 'ستائر زيبرا Z298-812',
    descEn: 'Warm timber texture zebra blinds for cozy room atmosphere',
    descAr: 'ستائر زيبرا بملمس خشب دافئ لإعطاء جو دافئ للغرفة',
    detailsEn: 'Dual-layer fabric providing privacy and adjustable light control.',
    detailsAr: 'قماش طبقتين يوفر الخصوصية والتحكم التام في إضاءة الغرفة.',
    category: 'Zebra',
    price: 1883,
    is_active: true,
    colors: [
      { id: 'c5', nameEn: 'Natural Oak', nameAr: 'خشب طبيعي', hex: '#A78BFA', isSoldOut: false }
    ]
  },
  {
    id: 'zbo-702',
    images: [
      '/photos for crystal/4.jpeg',
      '/photos for crystal/ستائر زيبرا.jpeg',
      '/photos for crystal/2.jpeg',
      '/photos for crystal/hero3.jpeg'
    ],
    alt: 'Zebra Blinds ZBO-702',
    labelEn: 'Zebra Blinds ZBO-702',
    labelAr: 'ستائر زيبرا ZBO-702',
    descEn: 'Classic beige dual system zebra blinds for modern interiors',
    descAr: 'ستائر زيبرا بيج كلاسيكية تناسب الديكورات العصرية',
    detailsEn: 'Sleek aluminum bottom bar with easy operation.',
    detailsAr: 'شريط سفلي من الألومنيوم الأنيق مع سهولة في الاستخدام.',
    category: 'Zebra',
    price: 2396,
    is_active: true,
    colors: [
      { id: 'c6', nameEn: 'Sand', nameAr: 'رملي', hex: '#E2E8F0', isSoldOut: false }
    ]
  },
  {
    id: 'blackout-roller-01',
    images: [
      '/photos for crystal/ستائر رول بلاك أوت.jpeg',
      '/photos for crystal/hero2.jpeg',
      '/photos for crystal/1.jpeg',
      '/photos for crystal/before.jpg.jpeg'
    ],
    alt: 'Blackout Roller Blinds',
    labelEn: 'Blackout Roller Blinds',
    labelAr: 'ستائر رول بلاك أوت',
    descEn: '100% complete blackout for total privacy and sleeping comfort',
    descAr: 'عزل كامل للضوء والحرارة بنسبة 100% لراحة ونوم مثالي',
    detailsEn: 'Thermal backing blocks UV rays and external temperature.',
    detailsAr: 'بطانة حرارية تحجب الأشعة فوق البنفسجية والحرارة الخارجية.',
    category: 'Blackout',
    price: 1450,
    is_active: true,
    colors: [
      { id: 'c7', nameEn: 'Dark Brown', nameAr: 'بني داكن', hex: '#3E2723', isSoldOut: false }
    ]
  },
  {
    id: 'sunscreen-roller-01',
    images: [
      '/photos for crystal/ستائر رول صن سكرين.jpeg',
      '/photos for crystal/hero1.jpeg',
      '/photos for crystal/moa.jpg.jpeg',
      '/photos for crystal/after.jpg.jpeg'
    ],
    alt: 'Sunscreen Roller Blinds',
    labelEn: 'Sunscreen Roller Blinds',
    labelAr: 'ستائر رول صن سكرين',
    descEn: 'Glare-free natural light while maintaining clear outside view',
    descAr: 'إضاءة طبيعية خالية من الوهج مع الحفاظ على الرؤية الخارجية',
    detailsEn: 'High performance sun barrier fabric reducing air conditioning load.',
    detailsAr: 'قماش واقي من الشمس عالي الأداء يقلل أحمال التكييف.',
    category: 'Sunscreen',
    price: 1300,
    is_active: true,
    colors: [
      { id: 'c8', nameEn: 'White Sunscreen', nameAr: 'أبيض', hex: '#FFFFFF', isSoldOut: false }
    ]
  },
  {
    id: 'printed-roller-01',
    images: [
      '/photos for crystal/printed_roller.png',
      '/photos for crystal/hero3.jpeg',
      '/photos for crystal/after.jpg.jpeg',
      '/photos for crystal/3.jpeg'
    ],
    alt: 'Printed Roller Blinds',
    labelEn: 'Printed Roller Blinds',
    labelAr: 'ستائر رول مطبوعة',
    descEn: 'Custom HD printed artistic designs for luxury living rooms',
    descAr: 'تصاميم ونقوش فنية مطبوعة بجودة عالية لغرف المعيشة',
    detailsEn: 'Vibrant non-fading colors printed on high-density roller fabric.',
    detailsAr: 'ألوان زاهية مقاومة للبهتان مطبوعة على قماش رول عالي الكثافة.',
    category: 'Sunlight',
    price: 1550,
    is_active: true,
    colors: [
      { id: 'c9', nameEn: 'Multi-color', nameAr: 'متعدد الألوان', hex: '#D4AF37', isSoldOut: false }
    ]
  },
  {
    id: 'wooden-bamboo-01',
    images: [
      '/photos for crystal/ستائر شرائح خشبيه.jpeg',
      '/photos for crystal/ستائر شرائح معدنية.jpeg',
      '/photos for crystal/hero1.jpeg',
      '/photos for crystal/1.jpeg'
    ],
    alt: 'Wooden & Bamboo Blinds',
    labelEn: 'Wooden & Bamboo Blinds',
    labelAr: 'ستائر شرائح خشبية وبامبو',
    descEn: 'Authentic natural wood slats offering timeless luxury',
    descAr: 'شرائح خشبية طبيعية تمنح المكان فخامة وأناقة دائمة',
    detailsEn: 'Crafted from premium basswood with tilt mechanism.',
    detailsAr: 'مصنوعة من خشب الطبيعي الممتاز مع آلية ميل مائلة.',
    category: 'Bamboo',
    price: 1850,
    is_active: true,
    colors: [
      { id: 'c10', nameEn: 'Walnut Wood', nameAr: 'خشب جوزي', hex: '#5D4037', isSoldOut: false }
    ]
  }
];

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
    
    if (error || !data || data.length === 0) {
      return DEFAULT_PRODUCTS;
    }

    return data.map((row: any) => ({
      id: row.id,
      images: row.images || [],
      alt: row.alt || '',
      labelEn: row.label_en || '',
      labelAr: row.label_ar || '',
      descEn: row.desc_en || '',
      descAr: row.desc_ar || '',
      detailsEn: row.details_en || '',
      detailsAr: row.details_ar || '',
      category: row.category || '',
      price: row.price || 0,
      is_active: row.is_active !== false,
      colors: row.colors || [],
    }));
  } catch (err) {
    console.error('Unexpected error fetching products:', err);
    return DEFAULT_PRODUCTS;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const products = await getProducts();
    const { data, error } = await supabase
      .from('website_assets')
      .select('url')
      .eq('key', 'homepage_curtains')
      .single();
    
    let featuredIds = [
      'b301c238-1234-4567-8901-abcdef123404', // Zebra
      'b301c238-1234-4567-8901-abcdef123407', // Roller
      'b301c238-1234-4567-8901-abcdef123401', // Blackout
      'b301c238-1234-4567-8901-abcdef123402', // Sun Screen
      'b301c238-1234-4567-8901-abcdef123406'  // Motorized
    ];
    
    if (!error && data && data.url) {
      featuredIds = data.url.split(',').filter(Boolean);
    }
    
    const featuredProducts: Product[] = [];
    for (const id of featuredIds) {
      const prod = products.find(p => p.id === id);
      if (prod) {
        featuredProducts.push(prod);
      }
    }
    
    if (featuredProducts.length === 0) {
      return products.slice(0, 5);
    }
    
    return featuredProducts;
  } catch (err) {
    console.error('Error fetching featured products:', err);
    return [];
  }
}
