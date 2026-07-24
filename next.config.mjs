/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Las Server Actions limitan el body a 1MB por defecto — una foto real de
    // celular (radiografías, fotos de caso) suele pesar varios MB y quedaba
    // rechazada en silencio. Se sube el límite para que la subida funcione.
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;
