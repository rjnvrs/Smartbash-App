import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://192.168.100.10:3000',
    'http://192.168.100.5:3000',
  ],
};

export default nextConfig;
