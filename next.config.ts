import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.shngm.id",
      },
    ],
  },

  rewrites: async () => {
    return [
      // {
      //   source: "/v1/api/mangas/:id/chapters/:chapter",
      //   destination: "https://api.shngm.io/v1/chapter/detail/:chapter",
      // },
      // {
      //   source: "/v1/api/mangas/:id/chapters/:path*",
      //   destination: "https://api.shngm.io/v1/chapter/:id/list/:path*",
      // },
      // {
      //   source: "/v1/api/mangas/:id",
      //   destination: "https://api.shngm.io/v1/manga/detail/:id",
      // },
      // {
      //   source: "/v1/api/mangas/:params*",
      //   destination: "https://api.shngm.io/v1/manga/list/:params*",
      // },
    ];
  },
};

export default nextConfig;
