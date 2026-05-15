/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  serverExternalPackages: ['pg'],

  bundlePagesRouterDependencies: true,
};

export default nextConfig;
