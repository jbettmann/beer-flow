/** @type {import('next').NextConfig} */
const nextConfig = {
  experiments: {
    topLevelAwait: true,
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "npaxzbaiagyllapbxeps.supabase.co",
        port: "",
        pathname: "/storage/**",
      },
    ],
  },
};

module.exports = {
  ...nextConfig,
  experimental: {
    serverActions: true,
  },
  env: {
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },

  // esmExternals: "loose", // <-- add this
  // serverComponentsExternalPackages: ["mongoose"], // <-- and this
};
