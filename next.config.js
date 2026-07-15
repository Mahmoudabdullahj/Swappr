/** @type {import('next').NextConfig} */
const path = require('path');
const supabaseHost = 'ekcsvucupmmgkekjjdqx.supabase.co';

const securityHeaders = [
  { key: 'X-Frame-Options',        value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection',       value: '1; mode=block' },
  { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      `img-src 'self' data: blob: https://${supabaseHost} https://images.unsplash.com https://i.pravatar.cc https://lh3.googleusercontent.com`,
      `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig = {
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', '@supabase/ssr'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: supabaseHost },
    ],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  webpack(config, { isServer, webpack }) {
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /next[\\/]dist[\\/]build[\\/]polyfills[\\/]polyfill-module/,
          path.resolve(__dirname, 'lib/empty.js')
        )
      );
    }
    return config;
  },
};

module.exports = nextConfig;
