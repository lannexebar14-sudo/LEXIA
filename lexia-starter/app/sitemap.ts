import type { MetadataRoute } from "next";
import { seoGuides } from "../lib/seo-guides";
import { extraSeoGuides } from "../lib/seo-guides-extra";

const BASE_URL = "https://lexiafrance.fr";
const allGuides = [...seoGuides, ...extraSeoGuides];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/conseils-juridiques`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/inscription`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/conditions`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  const guides: MetadataRoute.Sitemap = allGuides.map((guide) => ({
    url: `${BASE_URL}/conseils-juridiques/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...guides];
}
