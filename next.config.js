/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["jspdf", "html2canvas"],
  },
  images: {
    domains: ["images.unsplash.com"], // for future image integration
  },
};

module.exports = nextConfig;
