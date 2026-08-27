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
};

export default nextConfig;
