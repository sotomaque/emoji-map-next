import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configure SWC for better minification
  swcMinify: true,
  // Optimize Lodash imports
  webpack: (config, { isServer }) => {
    // Use lodash-es for client bundles
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'lodash': 'lodash-es',
        'react/jsx-runtime': 'react/jsx-runtime.js',
        'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
      };
    }
    return config;
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize image handling
  images: {
    formats: ['image/avif', 'image/webp'],
    // Disable image optimization in development for faster builds
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Enable production source maps for better debugging
  productionBrowserSourceMaps: false,
  // Optimize build output
  output: 'standalone',
  // Optimize page loading with experimental features
  experimental: {
    // Enable optimistic client cache for faster navigation
    optimisticClientCache: true,
    // Enable server actions for better performance
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};


export default withBundleAnalyzer(nextConfig);