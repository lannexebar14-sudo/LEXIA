import type { MetadataRoute } from "next";
import { seoGuides } from "../lib/seo-guides";
import { extraSeoGuides } from "../lib/seo-guides-extra";

const BASE_URL = "https://lexiafrance.fr";
const UPDATED = new Date("2026-08-12T00:00:00+02:00");
const allGuides = [...seoGuides, ...extraSeoGuides];
const categories = ["logement", "travail", "famille", "consommation", "entreprise", "administration"];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: UPDATED, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/orientation-juridique`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE_URL}/impayes`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE_URL}/conseils-juridiques`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE_URL}/notre-histoire`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/conditions`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/confidentialite`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/conseils-juridiques/categorie/${category}`,
    lastModified: UPDATED,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const guides: MetadataRoute.Sitemap = allGuides.map((guide) => ({
    url: `${BASE_URL}/conseils-juridiques/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  return [...staticPages, ...categoryPages, ...guides];
}
