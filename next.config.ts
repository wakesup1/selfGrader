import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev-mode internal resource access from the tunnel domain
  allowedDevOrigins: ['web.nograder.dev'],

  // Allow Server Actions (signOut, etc.) from the production domain via Cloudflare Tunnel.
  // Without this, Next.js CSRF check compares origin vs x-forwarded-host and blocks the action.
  experimental: {
    serverActions: {
      allowedOrigins: ['web.nograder.dev'],
    },
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'web.nograder.dev' },
    ],
  },
};

export default nextConfig;