import { supabase } from './supabase';

export interface WebsiteAsset {
  id: string;
  key: string;
  url: string;
  description: string | null;
  updated_at: string;
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
