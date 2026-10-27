import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The workspace preview used to live at /learning.
    return [{ source: "/learning", destination: "/learn", permanent: true }];
  },
  images: {
    // Next 16 optimises only local images whose path matches one of these — every local <Image
    // src> in the app needs an entry here, or it 400s. Unit cover photos are additionally
    // cache-busted with ?v=<n> (see PHOTO_VERSION in components/workspace/Dashboard.tsx) so a
    // replaced photo is never served stale from the image-optimisation cache; add the new value
    // here whenever a version number in PHOTO_VERSION goes up.
    localPatterns: [
      { pathname: "/no%20barriers%20logo.jpeg" },
      { pathname: "/landing/**" },
      { pathname: "/supporters/**" },
      { pathname: "/units/**", search: "?v=1" },
      { pathname: "/units/**", search: "?v=2" },
    ],
  },
};

export default nextConfig;
