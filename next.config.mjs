/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push(
      "pino-pretty" /* add any other modules that might be causing the error */
    );
    return config;
  },
  serverRuntimeConfig: {
    // Set custom timeout
    maxPageSize: 10 * 1024 * 1024, // 10MB
  },
  // async redirects() {
  //   return [
  //     {
  //       source: "/redirect-me",
  //       destination: "/target",
  //       permanent: true,
  //     },
  //   ];
  // },
  output: "export",
};

export default nextConfig;
