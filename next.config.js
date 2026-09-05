/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.workers.dev'],
    },
  },
};

module.exports = nextConfig;
