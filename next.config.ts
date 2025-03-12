import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
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
  // Configure webpack for better tree shaking
  webpack: (config, { isServer }) => {
    // Only apply these optimizations for client-side bundles
    if (!isServer) {
      // Alias lodash to lodash-es for better tree shaking
      config.resolve.alias = {
        ...config.resolve.alias,
        lodash: 'lodash-es',
      };
    }

    // Enable proper tree shaking for all packages
    config.optimization = {
      ...config.optimization,
      // Ensure unused exports are removed
      usedExports: true,
      // Enable module concatenation for better tree shaking
      concatenateModules: true,
    };

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
