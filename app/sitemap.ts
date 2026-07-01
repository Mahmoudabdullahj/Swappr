import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://swappr.jo';

  const supabase = await createClient();
  const { data: items } = await supabase
    .from('items')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  const itemUrls: MetadataRoute.Sitemap = (items ?? []).map((item) => ({
    url: `${base}/items/${item.id}`,
    lastModified: new Date(item.created_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...itemUrls,
  ];
}
