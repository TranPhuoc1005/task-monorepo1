const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
    outputFileTracingRoot: path.join(__dirname, "../../"),
    transpilePackages: ['@taskpro/shared'],
};

module.exports = nextConfig;