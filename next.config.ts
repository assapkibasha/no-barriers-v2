import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The workspace preview used to live at /learning.
    return [{ source: "/learning", destination: "/learn", permanent: true }];
  },
};

export default nextConfig;
