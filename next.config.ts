import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler disabled — causes heap OOM crashes in dev
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
