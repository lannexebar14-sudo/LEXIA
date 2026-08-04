import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/lexia",
    name: "LEXIA — Assistance juridique",
    short_name: "LEXIA",
    description: "Déposez votre dossier, échangez avec un juriste et recevez vos notifications.",
    start_url: "/tableau-de-bord",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f4f1ea",
    theme_color: "#091d33",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
