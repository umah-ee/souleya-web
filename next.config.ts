import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  redirects: async () => [
    // .html Redirects fuer alte Landing-Page-URLs
    {
      source: '/impressum.html',
      destination: '/impressum',
      permanent: true,
    },
    {
      source: '/datenschutz.html',
      destination: '/datenschutz',
      permanent: true,
    },
    {
      source: '/agb.html',
      destination: '/agb',
      permanent: true,
    },
    {
      source: '/blog.html',
      destination: '/de/blog',
      permanent: true,
    },
    {
      source: '/dashboard.html',
      destination: '/dashboard',
      permanent: true,
    },
  ],
};

export default nextConfig;
