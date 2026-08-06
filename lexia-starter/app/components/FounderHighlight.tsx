"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function FounderHighlight() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    let insertedSection: HTMLElement | null = null;
    let attempts = 0;

    function mountFounderSection() {
      if (document.querySelector("[data-lexia-founder]")) return true;

      const anchor = document.querySelector(".trust-strip");
      if (!anchor) return false;

      const section = document.createElement("section");
      section.className = "founder-highlight";
      section.setAttribute("data-lexia-founder", "true");
      section.innerHTML = `
        <div class="public-container founder-card">
          <div class="founder-photo" role="img" aria-label="Valentin Thiery, créateur et fondateur de LEXIA"></div>
          <div class="founder-copy">
            <span>CRÉÉ ET FONDÉ PAR</span>
            <h2>Valentin Thiery</h2>
            <p>LEXIA est née d’un constat simple : rendre l’accès au droit plus rapide, plus humain et plus accessible.</p>
            <p>Développée avec des avocats, juristes, développeurs et spécialistes du numérique, la plateforme accompagne particuliers et professionnels partout en France.</p>
            <strong>Créateur et fondateur de LEXIA</strong>
          </div>
          <div class="founder-facts">
            <div><b>49 000+</b><span>avocats référencés</span></div>
            <div><b>24h/24</b><span>7 jours sur 7</span></div>
            <div><b>100 %</b><span>confidentiel</span></div>
          </div>
        </div>
      `;

      anchor.insertAdjacentElement("afterend", section);
      insertedSection = section;
      return true;
    }

    if (mountFounderSection()) return;

    const interval = window.setInterval(() => {
      attempts += 1;
      if (mountFounderSection() || attempts >= 30) {
        window.clearInterval(interval);
      }
    }, 200);

    return () => {
      window.clearInterval(interval);
      insertedSection?.remove();
    };
  }, [pathname]);

  return null;
}
