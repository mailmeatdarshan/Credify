/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'pdfkit',
      'pdf-parse',
      'fontkit',
      'restructure',
      'iconv-lite',
      'png-js',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        'pdfkit',
        'pdf-parse',
        'fontkit',
        'restructure',
        'iconv-lite',
        'canvas',
      ];
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
