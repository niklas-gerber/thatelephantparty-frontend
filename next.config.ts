import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000', // Korrigiert von 3001 auf 3000
        pathname: '/posters/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000', // Korrigiert von 3001 auf 3000
        pathname: '/uploads/**', // Hinzugefügt für Payslips
      },
      {
        protocol: 'http',
        hostname: 'backend',
        port: '3000',
        pathname: '/posters/**',
      },
      {
        protocol: 'http',
        hostname: 'backend',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
  eslint: {
    // Ignoriert ESLint-Fehler beim Production Build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignoriert TypeScript-Fehler beim Production Build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;