import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/dashboard/"],
    },
    sitemap: "https://lexiafrance.fr/sitemap.xml",
    host: "https://lexiafrance.fr",
  };
}
