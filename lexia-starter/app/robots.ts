import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/administration/",
          "/tableau-de-bord/",
          "/verification-admin",
          "/finaliser-compte",
          "/nouveau-dossier",
          "/api/",
        ],
      },
    ],
    sitemap: "https://lexiafrance.fr/sitemap.xml",
    host: "https://lexiafrance.fr",
  };
}
