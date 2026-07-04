/** @type {import('next').NextConfig} */
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
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://rsms.me",
      "font-src 'self' https://fonts.gstatic.com https://rsms.me",
      `img-src 'self' data: blob: https://${supabaseHost} https://images.unsplash.com https://i.pravatar.cc`,
      `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig = {
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
};

module.exports = nextConfig;
