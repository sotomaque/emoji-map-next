import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    // Use lodash-es for client bundles
    // Note: This may cause issues with swagger-ui-react which requires lodash/fp modules
    // If you need swagger-ui-react, you may need to modify this configuration
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        lodash: 'lodash-es',
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
