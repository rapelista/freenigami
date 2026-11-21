import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.shngm.id',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shinigami.gg',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
