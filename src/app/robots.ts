import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/login', '/auth/', '/willkommen', '/pulse', '/discover', '/circles', '/chat', '/profile', '/studio', '/admin'],
      },
    ],
    sitemap: 'https://souleya.com/sitemap.xml',
  };
}
