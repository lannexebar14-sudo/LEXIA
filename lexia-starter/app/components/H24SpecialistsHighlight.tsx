"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function H24SpecialistsHighlight() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const announcement = document.querySelector<HTMLElement>(".announcement span");
    if (announcement) announcement.textContent = "Des spécialistes vous répondent 24h/24 et 7j/7";

    const heroLabel = document.querySelector<HTMLElement>(".hero-label");
    if (heroLabel) heroLabel.innerHTML = '<span>●</span> Spécialistes disponibles 24h/24 · 7j/7';

    const heroCopy = document.querySelector<HTMLElement>(".hero-copy");
    if (heroCopy && !heroCopy.querySelector(".h24-highlight")) {
      const highlight = document.createElement("div");
      highlight.className = "h24-highlight";
      highlight.innerHTML = '<strong>UNE ÉQUIPE DISPONIBLE À TOUT MOMENT</strong><span>Déposez votre demande de jour comme de nuit : un spécialiste peut vous répondre 24h/24 et 7j/7 depuis votre espace sécurisé.</span>';
      const buttons = heroCopy.querySelector(".hero-buttons");
      heroCopy.insertBefore(highlight, buttons);
    }

    const firstTrust = document.querySelector<HTMLElement>(".trust-items > div:first-child p");
    if (firstTrust) firstTrust.innerHTML = "<strong>Réponse 24h/24</strong>Des spécialistes disponibles 7 jours sur 7.";
  }, [pathname]);

  return null;
}
