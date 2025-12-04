const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV
  }
};

export default nextConfig;
