import Link from "next/link";
import type { ReactNode } from "react";
import "../legal/legal.css";

export const company = {
  name: "JEANECO",
  form: "SARL",
  capital: "100 €",
  siren: "989 763 354",
  siret: "989 763 354 00010",
  rcs: "RCS Caen 989 763 354",
  vat: "FR85989763354",
  address: "3 rue Vaullegeard, 14110 Condé-en-Normandie, France",
  director: "Steven BURGOT",
  email: "contact@lexiafrance.fr",
  brand: "LEXIA",
};

export function LegalPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <main className="legal-shell">
      <header className="legal-hero">
        <Link href="/" className="legal-logo">LEXIA<span>.</span></Link>
        <p>INFORMATIONS JURIDIQUES</p>
        <h1>{title}</h1>
        {intro ? <div className="legal-intro">{intro}</div> : null}
        <small>Version 1.0 — Août 2026</small>
      </header>
      <article className="legal-document">{children}</article>
      <nav className="legal-nav" aria-label="Documents juridiques">
        <Link href="/mentions-legales">Mentions légales</Link>
        <Link href="/cgu">CGU</Link>
        <Link href="/cgv">CGV</Link>
        <Link href="/confidentialite">Confidentialité</Link>
        <Link href="/cookies">Cookies</Link>
        <Link href="/remboursement">Remboursement</Link>
      </nav>
    </main>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section><h2>{title}</h2>{children}</section>;
}
