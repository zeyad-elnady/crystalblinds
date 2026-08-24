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
 * Derives a clean, unique SEO slug for a product.
 * Prefers explicit slug with submodel disambiguation, then labelEn + model, then labelAr, then id.
 */
export function getProductSlug(product: {
  slug?: string | null;
  labelEn?: string | null;
  labelAr?: string | null;
  label_en?: string | null;
  label_ar?: string | null;
  id?: string | null;
}): string {
  const explicitSlug = (product.slug || '').trim();
  const labelEn = (product.labelEn || product.label_en || '').trim();
  const labelAr = (product.labelAr || product.label_ar || '').trim();

  // Extract model code or distinguishing English alphanumeric tokens from labelAr
  const latinTokens = (labelAr.match(/[A-Za-z0-9]+/g) || []).join('-').toLowerCase();

  if (explicitSlug) {
    const cleanExplicit = slugify(explicitSlug);
    // If explicit slug is generic (e.g. "zebra-blinds" or "wooden-blinds") but labelAr has a distinguishing model
    if (latinTokens && !cleanExplicit.includes(latinTokens)) {
      return `${cleanExplicit}-${latinTokens}`;
    }
    return cleanExplicit;
  }

  if (labelEn) {
    const cleanEn = slugify(labelEn);
    if (latinTokens && !cleanEn.includes(latinTokens)) {
      return `${cleanEn}-${latinTokens}`;
    }
    return cleanEn;
  }

  if (labelAr) {
    return slugify(labelAr);
  }

  return product.id ? slugify(product.id) : '';
}
