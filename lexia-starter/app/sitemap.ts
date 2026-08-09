import type { MetadataRoute } from "next";
import { seoGuides } from "../lib/seo-guides";
import { extraSeoGuides } from "../lib/seo-guides-extra";

const BASE_URL = "https://lexiafrance.fr";
const allGuides = [...seoGuides, ...extraSeoGuides];
const categories = ["logement", "travail", "famille", "consommation", "entreprise", "administration"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/orientation`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE_URL}/impayes`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE_URL}/conseils-juridiques`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE_URL}/inscription`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/connexion`, lastModified: now, changeFrequency: "monthly", priority: 0.45 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/conditions`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/conseils-juridiques/categorie/${category}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const guides: MetadataRoute.Sitemap = allGuides.map((guide) => ({
    url: `${BASE_URL}/conseils-juridiques/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: "monthly",
    priority: 0.82,
  }));

  return [...staticPages, ...categoryPages, ...guides];
}
