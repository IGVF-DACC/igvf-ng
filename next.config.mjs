/** @type {import('next').NextConfig} */

/**
 * Change the UI version number for each igvf-ui release.
 */
const UI_VERSION = "8.16.0";

const nextConfig = {
  trailingSlash: true,
  reactStrictMode: false,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "s.gravatar.com",
      "localhost",
    ],
  },
  serverRuntimeConfig: {
    BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "",
  },
  publicRuntimeConfig: {
    SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || "",
    PUBLIC_BACKEND_URL:
      process.env.NEXT_PUBLIC_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "",
    UI_VERSION,
  },
  async redirects() {
    return [
      {
        source: "/profiles/graph.dot",
        destination: "/profiles/graph.svg",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
