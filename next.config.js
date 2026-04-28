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
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
