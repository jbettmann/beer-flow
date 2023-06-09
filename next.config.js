/** @type {import('next').NextConfig} */
const nextConfig = {
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
  env: {
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },
  experiments: {
    topLevelAwait: true,
    appDir: true,
    // esmExternals: "loose", // <-- add this
    // serverComponentsExternalPackages: ["mongoose"], // <-- and this
  },
};
