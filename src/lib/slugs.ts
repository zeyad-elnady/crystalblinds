/**
 * Utility functions for generating and sanitizing URL slugs
 */

/**
 * Converts a string into a URL-friendly slug.
 * Handles English, Arabic text, numbers, and strips special characters.
 */
export function slugify(text: string): string {
  if (!text) return '';

  return text
    .toString()
    .trim()
    .toLowerCase()
    // Replace spaces and underscores with a hyphen
    .replace(/[\s_]+/g, '-')
    // Remove unwanted special punctuation characters except hyphens and alphanumeric (including Arabic Unicode range)
    .replace(/[^\w\u0600-\u06FF\-]+/g, '')
    // Replace multiple hyphens with a single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Derives a clean SEO slug for a product.
 * Prefers product's explicit slug, then labelEn, then labelAr, then id.
 */
export function getProductSlug(product: {
  slug?: string | null;
  labelEn?: string | null;
  labelAr?: string | null;
  label_en?: string | null;
  label_ar?: string | null;
  id?: string | null;
}): string {
  if (product.slug && typeof product.slug === 'string' && product.slug.trim()) {
    return slugify(product.slug);
  }

  const enName = product.labelEn || product.label_en;
  if (enName && enName.trim()) {
    const slug = slugify(enName);
    if (slug) return slug;
  }

  const arName = product.labelAr || product.label_ar;
  if (arName && arName.trim()) {
    const slug = slugify(arName);
    if (slug) return slug;
  }

  return product.id ? slugify(product.id) : '';
}
