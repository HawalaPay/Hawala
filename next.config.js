// next.config.js

module.exports = {
  // React Strict Mode helps with development by identifying potential issues
  reactStrictMode: true,

  // Webpack customizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Add any client-side specific Webpack configurations here, if needed
    }
    return config; // Ensure the config is returned properly after modifications
  },

  // Image optimization settings: allowing images from external domains
  images: {
    domains: ['example.com'], // Replace 'example.com' with your external image domains
  },

  // Environment variables for the application
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com',
  },

  // Redirects to handle routing changes or URL structure modifications
  async redirects() {
    return [
      {
        source: '/old-page',    // Source URL to redirect
        destination: '/new-page', // Target destination URL
        permanent: true,        // Permanent redirect (301), use 'false' for temporary (302)
      },
    ];
  },

  // Additional customizations can be added below
  // Example: Adding custom headers or rewrites
  // headers: async () => {
  //   return [
  //     {
  //       source: '/(.*)', // Apply to all routes
  //       headers: [
  //         {
  //           key: 'X-Custom-Header',
  //           value: 'my-custom-header-value',
  //         },
  //       ],
  //     },
  //   ];
  // },

  // Rewrites example (uncomment if you need URL rewrites)
  // rewrites: async () => {
  //   return [
  //     {
  //       source: '/old-path', // Source URL to rewrite
  //       destination: '/new-path', // New destination to rewrite to
  //     },
  //   ];
  // },

  // Any other Next.js config options you may need
};
