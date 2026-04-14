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
      url: 'https://souleya.com/preise',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://souleya.com/ueber-uns',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://souleya.com/was-ist-souleya',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://souleya.com/features/circles',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://souleya.com/features/studio',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://souleya.com/features/events',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
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
    {
      url: 'https://souleya.com/mentor',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://souleya.com/reflexion',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://souleya.com/impressum',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://souleya.com/datenschutz',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://souleya.com/agb',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Published Artikel dynamisch laden (beide Locales fuer locale-spezifische Slugs)
  try {
    const [deRes, enRes] = await Promise.all([
      fetch(`${API_URL}/articles?locale=de&limit=50`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/articles?locale=en&limit=50`, { next: { revalidate: 3600 } }),
    ]);

    if (deRes.ok) {
      const { data: deArticles } = await deRes.json();
      for (const article of deArticles) {
        entries.push({
          url: `https://souleya.com/de/blog/${article.locale_slug || article.slug}`,
          lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    if (enRes.ok) {
      const { data: enArticles } = await enRes.json();
      for (const article of enArticles) {
        entries.push({
          url: `https://souleya.com/en/blog/${article.locale_slug || article.slug}`,
          lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch {
    // API nicht erreichbar – nur statische Einträge
  }

  return entries;
}
