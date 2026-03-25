/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  serverExternalPackages: ['sqlite3'],
}
module.exports = nextConfig
