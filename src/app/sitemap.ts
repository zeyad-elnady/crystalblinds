import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/products';
import { getProductSlug } from '@/lib/slugs';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // revalidate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://crystalblinds-eg.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ar/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ar/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/en/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  try {
    const products = await getProducts();
    const activeProducts = products.filter(p => p.is_active !== false);

    const productRoutes: MetadataRoute.Sitemap = activeProducts.flatMap(product => {
      const slug = product.slug || getProductSlug(product);
      if (!slug) return [];

      return [
        {
          url: `${baseUrl}/ar/products/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/en/products/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
      ];
    });

    return [...staticRoutes, ...productRoutes];
  } catch (err) {
    console.error('Error generating dynamic product sitemap:', err);
    return staticRoutes;
  }
}
