import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { seoGuides } from "../../../../lib/seo-guides";
import { extraSeoGuides } from "../../../../lib/seo-guides-extra";

const allGuides = [...seoGuides, ...extraSeoGuides];

const categories = {
  logement: {
    label: "Logement",
    title: "Droit du logement : location, bail, loyer et voisinage",
    description: "Guides pratiques sur les litiges locatifs, le dépôt de garantie, les charges, le loyer, le préavis et les troubles de voisinage.",
    intro: "Les litiges liés au logement reposent souvent sur des documents précis : bail, états des lieux, quittances, échanges et justificatifs. Retrouvez les premiers réflexes pour préparer votre dossier avant une démarche amiable ou contentieuse.",
  },
  travail: {
    label: "Travail",
    title: "Droit du travail : salaire, licenciement et prud'hommes",
    description: "Guides pratiques sur le salaire, les heures supplémentaires, le licenciement, le harcèlement, la rupture conventionnelle et les prud'hommes.",
    intro: "Un litige professionnel se prépare avec une chronologie claire et des preuves directement liées aux faits : contrat, bulletins, courriers, plannings et échanges. Ces guides vous aident à organiser les premières étapes.",
  },
  famille: {
    label: "Famille",
    title: "Droit de la famille : séparation, enfants et pension alimentaire",
    description: "Guides pratiques sur la séparation, la résidence des enfants, le droit de visite, la pension alimentaire et les documents à préparer.",
    intro: "Les situations familiales nécessitent de distinguer les questions relatives aux enfants, aux finances et à l'organisation quotidienne. Une préparation méthodique permet de mieux comprendre les démarches possibles.",
  },
  consommation: {
    label: "Consommation",
    title: "Droit de la consommation : achats, garanties et abonnements",
    description: "Guides pratiques pour les commandes non livrées, produits défectueux, remboursements, abonnements et litiges avec des professionnels.",
    intro: "En matière de consommation, les preuves d'achat, conditions de vente, factures et échanges avec le professionnel sont essentielles. Les guides LEXIA vous aident à structurer une réclamation claire.",
  },
  entreprise: {
    label: "Entreprise",
    title: "Droit des entreprises : impayés, fournisseurs et litiges commerciaux",
    description: "Guides pratiques pour les factures impayées, mises en demeure, fournisseurs et principaux litiges commerciaux.",
    intro: "Pour une entreprise, un litige doit être traité rapidement tout en conservant les preuves contractuelles et comptables. Contrats, devis, factures, bons de commande et échanges constituent souvent le cœur du dossier.",
  },
  administration: {
    label: "Administration",
    title: "Droit administratif : amendes et recours contre une décision",
    description: "Guides pratiques pour comprendre les premières démarches face à une amende ou une décision administrative défavorable.",
    intro: "Les recours administratifs sont souvent soumis à des procédures et délais précis. Dès réception d'une décision, identifiez sa date, son auteur, ses motifs et les voies de recours indiquées.",
  },
} as const;

type CategorySlug = keyof typeof categories;

export function generateStaticParams() {
  return Object.keys(categories).map((category) => ({ category }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const config = categories[params.category as CategorySlug];
  if (!config) return {};
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: `/conseils-juridiques/categorie/${params.category}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `/conseils-juridiques/categorie/${params.category}`,
      siteName: "LEXIA",
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const config = categories[params.category as CategorySlug];
  if (!config) notFound();
  const guides = allGuides.filter((guide) => guide.category === config.label);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: config.title,
    description: config.description,
    url: `https://lexiafrance.fr/conseils-juridiques/categorie/${params.category}`,
    inLanguage: "fr-FR",
    isPartOf: { "@type": "WebSite", name: "LEXIA", url: "https://lexiafrance.fr" },
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f5f2eb", color: "#14243a", fontFamily: "Arial, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <header style={{ background: "#0b2340", color: "#fff", padding: "22px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ color: "#fff", textDecoration: "none", font: "700 30px Georgia" }}>LEXIA<span style={{ color: "#d7bb76" }}>.</span></Link>
          <Link href="/conseils-juridiques" style={{ color: "#fff", textDecoration: "none", fontWeight: 800 }}>Tous les guides</Link>
        </div>
      </header>

      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 20px 30px" }}>
        <nav aria-label="Fil d’Ariane" style={{ fontSize: 13, color: "#6c7684", marginBottom: 24 }}>
          <Link href="/" style={{ color: "#6c7684" }}>Accueil</Link> / <Link href="/conseils-juridiques" style={{ color: "#6c7684" }}>Conseils juridiques</Link> / {config.label}
        </nav>
        <span style={{ color: "#987636", fontWeight: 900, fontSize: 12, letterSpacing: 1.5 }}>DROIT · {config.label.toUpperCase()}</span>
        <h1 style={{ maxWidth: 840, font: "700 46px/1.1 Georgia", color: "#0b2340", margin: "12px 0 18px" }}>{config.title}</h1>
        <p style={{ maxWidth: 840, fontSize: 18, lineHeight: 1.7, color: "#5d6978" }}>{config.intro}</p>
      </section>

      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "10px 20px 70px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 16 }}>
          {guides.map((guide) => (
            <article key={guide.slug} style={{ background: "#fff", border: "1px solid #e1dbd0", borderRadius: 18, padding: 22 }}>
              <span style={{ color: "#9a793a", fontSize: 11, fontWeight: 900, letterSpacing: 1.2 }}>{guide.category.toUpperCase()}</span>
              <h2 style={{ font: "700 24px/1.2 Georgia", color: "#0b2340", margin: "10px 0" }}>{guide.title}</h2>
              <p style={{ color: "#687483", lineHeight: 1.6 }}>{guide.description}</p>
              <Link href={`/conseils-juridiques/${guide.slug}`} style={{ color: "#0b2340", textDecoration: "none", fontWeight: 900 }}>Lire le guide →</Link>
            </article>
          ))}
        </div>
      </section>

      <section style={{ background: "#0b2340", color: "#fff", padding: "44px 20px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ font: "700 32px Georgia", margin: "0 0 12px" }}>Votre situation nécessite une analyse personnalisée ?</h2>
          <p style={{ color: "#d4dce5", lineHeight: 1.65 }}>Décrivez les faits et transmettez vos documents à LEXIA depuis votre espace sécurisé.</p>
          <Link href="/inscription" style={{ display: "inline-block", marginTop: 10, background: "#d7bb76", color: "#0b2340", padding: "14px 18px", borderRadius: 12, textDecoration: "none", fontWeight: 900 }}>Déposer ma demande</Link>
        </div>
      </section>
    </main>
  );
}
