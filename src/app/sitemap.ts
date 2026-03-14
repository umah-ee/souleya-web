import type { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: 'https://souleya.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://souleya.com/de/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://souleya.com/en/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Published Artikel dynamisch laden
  try {
    const res = await fetch(`${API_URL}/articles?limit=50`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const { data: articles } = await res.json();

      for (const article of articles) {
        entries.push(
          {
            url: `https://souleya.com/de/blog/${article.slug}`,
            lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          },
          {
            url: `https://souleya.com/en/blog/${article.slug}`,
            lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          },
        );
      }
    }
  } catch {
    // API nicht erreichbar – nur statische Einträge
  }

  return entries;
}
