import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler disabled — causes heap OOM crashes in dev
  async redirects() {
    return [
      {
        source: '/',
        destination: '/ar',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
