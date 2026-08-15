import { supabase } from './supabase';

export interface WebsiteAsset {
  id: string;
  key: string;
  url: string;
  description: string | null;
  updated_at: string;
}

/**
 * Fetches a single website asset URL by its unique key.
 * Falls back to fallbackUrl if not found or if an error occurs.
 */
export async function getWebsiteAsset(key: string, fallbackUrl: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('website_assets')
      .select('url')
      .eq('key', key)
      .single();

    if (!error && data?.url) {
      return data.url;
    }
  } catch (err) {
    console.error(`Error fetching website asset for key "${key}":`, err);
  }
  return fallbackUrl;
}

/**
 * Fetches all website assets from Supabase and returns them as a Record<key, url>
 * It can be used by server components to pass images down to client components.
 */
export async function getWebsiteImages(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase.from('website_assets').select('key, url');
    if (error) {
      console.error('Error fetching website images:', error);
      return {};
    }
    
    if (!data) return {};

    const imageMap: Record<string, string> = {};
    for (const asset of data) {
      imageMap[asset.key] = asset.url;
    }
    return imageMap;
  } catch (err) {
    console.error('Unexpected error fetching website images:', err);
    return {};
  }
}
