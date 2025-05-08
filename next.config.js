/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "api.slingacademy.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "omlnjbcckhowlpkhorry.supabase.co",
        port: "",
        pathname: "/storage/**",
      },

      {
        protocol: "https",
        hostname: "api.slingacademy.com",
        port: "",
        pathname: "/**",
      },
    ],
    loader: "custom",
    loaderFile: "./src/components/supabase-image-loader.ts",
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
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  // esmExternals: "loose", // <-- add this
  // serverComponentsExternalPackages: ["mongoose"], // <-- and this
};
