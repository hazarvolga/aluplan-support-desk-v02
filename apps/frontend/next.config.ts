import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        typedRoutes: false,
    },
};

export default nextConfig;
