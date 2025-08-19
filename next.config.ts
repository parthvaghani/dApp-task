import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle React Native packages that shouldn't be bundled for web
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

    // Handle @react-native-async-storage/async-storage
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };

    // Exclude problematic packages from client bundle
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@react-native-async-storage/async-storage': 'commonjs @react-native-async-storage/async-storage',
      });
    }

    return config;
  },
  // Ensure proper environment variable handling
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Optimize for Vercel deployment
  experimental: {
    optimizePackageImports: ['@web3auth/modal', '@web3auth/base'],
  },
};

export default nextConfig;
