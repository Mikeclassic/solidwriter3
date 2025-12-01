/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This fixes the "Module parse failed" error for onnxruntime
    serverComponentsExternalPackages: ['@xenova/transformers', 'onnxruntime-node'],
    
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "lucide-react"
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ]
  }
}

module.exports = nextConfig
