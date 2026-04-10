import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  importScripts: ['/sw-custom.js'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/js\.api\.mappable\.world\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'vk-maps-tiles',
        expiration: { maxEntries: 500, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.mappable\.world\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'vk-maps-assets',
        expiration: { maxEntries: 1000, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/api\/v1\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-responses',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(png|jpg|jpeg|svg|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

export default withPWA(nextConfig);
