/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdfjs-dist", "mammoth", "pdf-parse"],
  },
};

export default nextConfig;
