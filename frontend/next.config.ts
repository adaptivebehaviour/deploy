import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    pageExtensions: ['js', 'jsx', 'md', 'ts', 'tsx'],
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'cdn.sanity.io',
            port: '',
            pathname: '/images/rmqbeuql/content/**',
          },
        ],
      }
};

export default nextConfig;
