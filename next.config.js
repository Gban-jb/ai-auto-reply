/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['openai'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.google.com' },
    ],
  },
}
module.exports = nextConfig
