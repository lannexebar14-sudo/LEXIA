import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSeoGuide, seoGuides } from "../../../lib/seo-guides";

export function generateStaticParams() {
  return seoGuides.map((guide) => ({ slug: guide.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = getSeoGuide(params.slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/conseils-juridiques/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      url: `/conseils-juridiques/${guide.slug}`,
      siteName: "LEXIA",
      locale: "fr_FR",
    },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getSeoGuide(params.slug);
  if (!guide) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    dateModified: guide.updatedAt,
    datePublished: guide.updatedAt,
    mainEntityOfPage: `https://lexiafrance.fr/conseils-juridiques/${guide.slug}`,
    author: { "@type": "Organization", name: "LEXIA", url: "https://lexiafrance.fr" },
    publisher: { "@type": "Organization", name: "LEXIA", url: "https://lexiafrance.fr" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://lexiafrance.fr" },
      { "@type": "ListItem", position: 2, name: "Conseils juridiques", item: "https://lexiafrance.fr/conseils-juridiques" },
      { "@type": "ListItem", position: 3, name: guide.title, item: `https://lexiafrance.fr/conseils-juridiques/${guide.slug}` },
    ],
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f7f4ee", color: "#17263b", fontFamily: "Arial, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <header style={{ background: "#0b2340", padding: "20px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
          <Link href="/" style={{ color: "#fff", textDecoration: "none", font: "700 30px Georgia" }}>LEXIA<span style={{ color: "#d7bb76" }}>.</span></Link>
          <Link href="/conseils-juridiques" style={{ color: "#fff", textDecoration: "none", fontWeight: 800 }}>Tous les guides</Link>
        </div>
      </header>

      <article style={{ maxWidth: 900, margin: "0 auto", padding: "54px 20px 80px" }}>
        <nav aria-label="Fil d’Ariane" style={{ fontSize: 13, marginBottom: 26, color: "#6c7684" }}>
          <Link href="/" style={{ color: "#6c7684" }}>Accueil</Link> / <Link href="/conseils-juridiques" style={{ color: "#6c7684" }}>Conseils juridiques</Link> / {guide.category}
        </nav>

        <span style={{ color: "#9a793a", fontWeight: 900, fontSize: 12, letterSpacing: 1.6 }}>{guide.category.toUpperCase()}</span>
        <h1 style={{ font: "700 46px/1.08 Georgia", color: "#0b2340", margin: "12px 0 18px" }}>{guide.title}</h1>
        <p style={{ fontSize: 20, lineHeight: 1.65, color: "#5f6a78", marginBottom: 14 }}>{guide.description}</p>
        <p style={{ fontSize: 13, color: "#87909a", marginBottom: 34 }}>Mis à jour le 7 août 2026 · Information générale, à adapter à votre situation.</p>

        <section style={{ background: "#fff", border: "1px solid #e4ded3", borderRadius: 20, padding: 26, marginBottom: 30 }}>
          <p style={{ fontSize: 18, lineHeight: 1.75, margin: 0 }}>{guide.intro}</p>
        </section>

        {guide.points.map((point) => (
          <section key={point.title} style={{ margin: "34px 0" }}>
            <h2 style={{ font: "700 30px Georgia", color: "#0b2340", marginBottom: 10 }}>{point.title}</h2>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: "#3d4a5b" }}>{point.text}</p>
          </section>
        ))}

        <section style={{ background: "#eef2f6", borderRadius: 20, padding: 26, margin: "38px 0" }}>
          <h2 style={{ font: "700 28px Georgia", color: "#0b2340", marginTop: 0 }}>Documents à préparer</h2>
          <ul style={{ paddingLeft: 22, lineHeight: 1.9, fontSize: 16 }}>
            {guide.checklist.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section style={{ margin: "42px 0" }}>
          <h2 style={{ font: "700 30px Georgia", color: "#0b2340" }}>Questions fréquentes</h2>
          {guide.faq.map((item) => (
            <div key={item.question} style={{ background: "#fff", border: "1px solid #e4ded3", borderRadius: 16, padding: 20, marginTop: 12 }}>
              <h3 style={{ margin: "0 0 8px", color: "#0b2340", fontSize: 18 }}>{item.question}</h3>
              <p style={{ margin: 0, color: "#4f5c6c", lineHeight: 1.65 }}>{item.answer}</p>
            </div>
          ))}
        </section>

        <aside style={{ background: "#0b2340", color: "#fff", borderRadius: 22, padding: 30, marginTop: 48 }}>
          <span style={{ color: "#d7bb76", fontSize: 12, fontWeight: 900, letterSpacing: 1.4 }}>BESOIN D’UNE ÉTUDE PERSONNALISÉE ?</span>
          <h2 style={{ font: "700 32px Georgia", margin: "10px 0" }}>Présentez votre situation à LEXIA.</h2>
          <p style={{ color: "#d5dbe4", lineHeight: 1.65 }}>Déposez les faits et vos documents dans un espace sécurisé afin d’obtenir une analyse adaptée à votre dossier.</p>
          <Link href="/inscription" style={{ display: "inline-block", marginTop: 10, background: "#d7bb76", color: "#0b2340", padding: "14px 18px", borderRadius: 12, textDecoration: "none", fontWeight: 900 }}>Déposer ma demande</Link>
        </aside>
      </article>
    </main>
  );
}
