"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import "./orientation.css";

type Answer = {
  label: string;
  key: string;
  icon: string;
  description: string;
  href: string;
  cta: string;
};

const situations: Answer[] = [
  { label: "Logement", key: "logement", icon: "⌂", description: "Bail, dépôt de garantie, travaux, voisinage, loyers ou expulsion.", href: "/nouveau-dossier?domaine=logement", cta: "Déposer un dossier logement" },
  { label: "Travail", key: "travail", icon: "◇", description: "Salaire, contrat, sanction, licenciement, rupture ou conditions de travail.", href: "/nouveau-dossier?domaine=travail", cta: "Déposer un dossier travail" },
  { label: "Consommation", key: "consommation", icon: "◎", description: "Achat, remboursement, abonnement, banque, assurance ou prestation.", href: "/nouveau-dossier?domaine=consommation", cta: "Déposer un dossier consommation" },
  { label: "Famille", key: "famille", icon: "♙", description: "Séparation, pension, autorité parentale ou démarches familiales.", href: "/nouveau-dossier?domaine=famille", cta: "Déposer un dossier famille" },
  { label: "Entreprise", key: "entreprise", icon: "▦", description: "Contrats, fournisseurs, clients, litige commercial ou relation B2B.", href: "/nouveau-dossier?domaine=entreprise", cta: "Déposer un dossier entreprise" },
  { label: "Impayé", key: "impaye", icon: "€", description: "Facture, loyer, prestation ou somme restant due.", href: "/impayes", cta: "Ouvrir LEXIA Impayés" },
  { label: "Administration", key: "administration", icon: "⌖", description: "Décision administrative, recours, contestation ou formalité.", href: "/nouveau-dossier?domaine=administration", cta: "Déposer un dossier administratif" },
  { label: "Je ne sais pas", key: "autre", icon: "?", description: "Votre situation ne rentre pas clairement dans une catégorie.", href: "/nouveau-dossier", cta: "Décrire ma situation" },
];

export default function OrientationJuridiquePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const result = useMemo(() => situations.find((item) => item.key === selected) ?? null, [selected]);

  return (
    <main className="orientation-page">
      <header className="orientation-header">
        <Link href="/" className="orientation-logo">LEXIA<span>.</span></Link>
        <Link href="/connexion" className="orientation-login">Connexion</Link>
      </header>

      <section className="orientation-hero">
        <div className="orientation-shell">
          <span className="orientation-kicker">ORIENTATION EXPRESS · 1 MINUTE</span>
          <h1>Par où commencer ?</h1>
          <p>Choisissez simplement le sujet qui ressemble le plus à votre situation. LEXIA vous dirige vers le bon parcours sans vous demander de connaître le vocabulaire juridique.</p>
          <div className="orientation-notice">Cette orientation sert uniquement à vous guider dans le site. Elle ne constitue pas un avis juridique ni une qualification définitive de votre situation.</div>
        </div>
      </section>

      <section className="orientation-shell orientation-content">
        <div className="orientation-step"><span>1</span><div><b>Quel est le sujet principal ?</b><small>Sélectionnez une seule catégorie.</small></div></div>
        <div className="orientation-grid">
          {situations.map((item) => (
            <button key={item.key} type="button" className={selected === item.key ? "orientation-card selected" : "orientation-card"} onClick={() => setSelected(item.key)}>
              <span className="orientation-icon">{item.icon}</span>
              <strong>{item.label}</strong>
              <p>{item.description}</p>
              <i>{selected === item.key ? "✓ Sélectionné" : "Choisir →"}</i>
            </button>
          ))}
        </div>

        {result && (
          <section className="orientation-result" aria-live="polite">
            <div>
              <span>PARCOURS CONSEILLÉ</span>
              <h2>{result.label}</h2>
              <p>{result.description}</p>
            </div>
            <div className="orientation-result-actions">
              <Link href={result.href} className="orientation-primary">{result.cta} →</Link>
              <Link href="/conseils-juridiques" className="orientation-secondary">Consulter les guides</Link>
            </div>
          </section>
        )}
      </section>

      <section className="orientation-bottom">
        <div className="orientation-shell">
          <div><span>VOUS HÉSITEZ ENCORE ?</span><h2>Décrivez les faits avec vos propres mots.</h2><p>Vous n’avez pas besoin de connaître la règle de droit applicable pour ouvrir un dossier.</p></div>
          <Link href="/nouveau-dossier" className="orientation-primary">Décrire ma situation →</Link>
        </div>
      </section>
    </main>
  );
}
