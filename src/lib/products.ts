import { supabase } from './supabase';
import { getProductSlug, slugify } from './slugs';

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
  slug?: string;
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
    slug: 'zebra-blinds-z11648-v3',
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
    slug: 'zebra-blinds-z11648-v6',
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
    slug: 'zebra-blinds-z298-812',
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
    slug: 'blackout-zebra-blinds-zbo-702',
    images: [
      '/photos for crystal/4.jpeg',
      '/photos for crystal/ستائر زيبرا.jpeg',
      '/photos for crystal/2.jpeg',
      '/photos for crystal/hero3.jpeg'
    ],
    alt: 'Blackout Zebra Blinds ZBO-702',
    labelEn: 'Blackout Zebra Blinds ZBO-702',
    labelAr: 'ستائر زيبرا بلاك أوت ZBO-702',
    descEn: 'Maximum room darkening capability with contemporary horizontal bands',
    descAr: 'تعتيم فائق للغرفة مع الحفاظ على المظهر العصري للشرائح',
    detailsEn: 'Blackout fabric weave offering near 100% light blockage.',
    detailsAr: 'نسيج بلاك أوت خاص يوفر حجب شبه تام للضوء والحرارة.',
    category: 'Blackout',
    price: 2150,
    is_active: true,
    colors: [
      { id: 'c6', nameEn: 'Charcoal', nameAr: 'فحمي', hex: '#374151', isSoldOut: false },
      { id: 'c7', nameEn: 'Off-White', nameAr: 'أوف وايت', hex: '#FAFAF9', isSoldOut: false }
    ]
  },
  {
    id: 'rl-classic-101',
    slug: 'classic-roller-blinds-101',
    images: [
      '/photos for crystal/ستائر رول.jpeg',
      '/photos for crystal/1.jpeg',
      '/photos for crystal/hero1.jpeg',
      '/photos for crystal/3.jpeg'
    ],
    alt: 'Classic Roller Blinds',
    labelEn: 'Classic Roller Blinds',
    labelAr: 'ستائر رول كلاسيك',
    descEn: 'Minimalist roller shades designed for clean lines and effortless control',
    descAr: 'تصميم بسيط وعملي يمنح النوافذ مظهراً عصرياً ومريحاً',
    detailsEn: 'Easy to clean and maintain, suitable for offices and homes.',
    detailsAr: 'سهلة التنظيف والصيانة، مثالية للمكاتب والمنازل.',
    category: 'Roller',
    price: 1450,
    is_active: true,
    colors: [
      { id: 'c8', nameEn: 'Snow White', nameAr: 'أبيض ثلجي', hex: '#FFFFFF', isSoldOut: false },
      { id: 'c9', nameEn: 'Warm Grey', nameAr: 'رمادي دافئ', hex: '#9CA3AF', isSoldOut: false }
    ]
  },
  {
    id: 'wd-slat-50',
    slug: 'wooden-bamboo-blinds',
    images: [
      '/photos for crystal/hero2.jpeg',
      '/photos for crystal/2.jpeg',
      '/photos for crystal/hero3.jpeg',
      '/photos for crystal/4.jpeg'
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

function mapProductRow(row: any): Product {
  const labelEn = row.label_en || '';
  const labelAr = row.label_ar || '';
  const computedSlug = row.slug || getProductSlug({ slug: row.slug, labelEn, labelAr, id: row.id });

  return {
    id: String(row.id),
    slug: computedSlug,
    images: row.images || [],
    alt: row.alt || labelEn || labelAr || '',
    labelEn,
    labelAr,
    descEn: row.desc_en || '',
    descAr: row.desc_ar || '',
    detailsEn: row.details_en || '',
    detailsAr: row.details_ar || '',
    category: row.category || '',
    price: Number(row.price) || 0,
    is_active: row.is_active !== false,
    colors: row.colors || [],
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error || !data || data.length === 0) {
      return DEFAULT_PRODUCTS;
    }

    return data.map(mapProductRow);
  } catch (err) {
    console.error('Unexpected error fetching products:', err);
    return DEFAULT_PRODUCTS;
  }
}

/**
 * Resolves a product by slug or legacy ID.
 * Returns product, whether it was accessed via a legacy identifier, and the canonical slug.
 */
export async function getProductBySlugOrId(identifier: string): Promise<{
  product: Product | null;
  isLegacy: boolean;
  canonicalSlug: string;
}> {
  if (!identifier) {
    return { product: null, isLegacy: false, canonicalSlug: '' };
  }

  const decoded = decodeURIComponent(identifier).trim();
  const normalizedSlug = slugify(decoded);

  try {
    // 1. Try direct database match by slug or id
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`slug.eq.${decoded},id.eq.${decoded},slug.eq.${normalizedSlug}`)
      .limit(1);

    if (data && data.length > 0 && !error) {
      const product = mapProductRow(data[0]);
      const canonicalSlug = product.slug || getProductSlug(product);
      const isLegacy = decoded === product.id && decoded !== canonicalSlug;
      return { product, isLegacy, canonicalSlug };
    }

    // 2. If not matched, query all products and match against derived slugs
    const allProducts = await getProducts();
    const matched = allProducts.find(
      p =>
        p.slug === decoded ||
        p.slug === normalizedSlug ||
        p.id === decoded ||
        slugify(p.labelEn) === normalizedSlug ||
        slugify(p.labelAr) === normalizedSlug
    );

    if (matched) {
      const canonicalSlug = matched.slug || getProductSlug(matched);
      const isLegacy = decoded === matched.id && decoded !== canonicalSlug;
      return { product: matched, isLegacy, canonicalSlug };
    }
  } catch (err) {
    console.error('Error in getProductBySlugOrId:', err);
  }

  // 3. Fallback search in DEFAULT_PRODUCTS
  const defaultMatch = DEFAULT_PRODUCTS.find(
    p =>
      p.slug === decoded ||
      p.slug === normalizedSlug ||
      p.id === decoded ||
      slugify(p.labelEn) === normalizedSlug ||
      slugify(p.labelAr) === normalizedSlug
  );

  if (defaultMatch) {
    const canonicalSlug = defaultMatch.slug || getProductSlug(defaultMatch);
    const isLegacy = decoded === defaultMatch.id && decoded !== canonicalSlug;
    return { product: defaultMatch, isLegacy, canonicalSlug };
  }

  return { product: null, isLegacy: false, canonicalSlug: '' };
}

export async function getProductById(id: string): Promise<Product | null> {
  const result = await getProductBySlugOrId(id);
  return result.product;
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
      const prod = products.find(p => p.id === id || p.slug === id);
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
