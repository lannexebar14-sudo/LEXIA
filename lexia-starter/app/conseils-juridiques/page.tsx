import type { Metadata } from "next";
import Link from "next/link";
import { seoGuides } from "../../lib/seo-guides";

export const metadata: Metadata = {
  title: "Conseils juridiques et guides pratiques",
  description: "Guides juridiques LEXIA sur le logement, le travail, la famille, la consommation et les litiges professionnels.",
  alternates: { canonical: "/conseils-juridiques" },
};

const categories = ["Logement", "Travail", "Famille", "Consommation", "Entreprise", "Démarches"];

export default function ConseilsJuridiquesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f5f2eb", color: "#14243a", fontFamily: "Arial, sans-serif" }}>
      <header style={{ background: "#0b2340", color: "#fff", padding: "22px 20px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
          <Link href="/" style={{ color: "#fff", textDecoration: "none", font: "700 30px Georgia" }}>LEXIA<span style={{ color: "#d7bb76" }}>.</span></Link>
          <Link href="/inscription" style={{ background: "#d7bb76", color: "#0b2340", padding: "12px 16px", borderRadius: 12, textDecoration: "none", fontWeight: 900 }}>Déposer ma demande</Link>
        </div>
      </header>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "64px 20px 34px" }}>
        <span style={{ color: "#987636", fontSize: 12, fontWeight: 900, letterSpacing: 1.8 }}>RESSOURCES JURIDIQUES LEXIA</span>
        <h1 style={{ maxWidth: 760, font: "700 48px/1.08 Georgia", color: "#0b2340", margin: "12px 0 18px" }}>Comprendre vos droits avant de passer à l’action.</h1>
        <p style={{ maxWidth: 780, fontSize: 18, lineHeight: 1.7, color: "#5d6978" }}>Retrouvez des guides pratiques pour identifier les premières démarches, préparer vos documents et mieux comprendre les options possibles. Ces contenus sont informatifs et ne remplacent pas l’étude personnalisée de votre situation.</p>
      </section>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px 70px" }}>
        {categories.map((category) => {
          const guides = seoGuides.filter((guide) => guide.category === category);
          if (!guides.length) return null;
          return (
            <section key={category} style={{ marginTop: 34 }}>
              <h2 style={{ font: "700 30px Georgia", color: "#0b2340", marginBottom: 16 }}>{category}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
                {guides.map((guide) => (
                  <article key={guide.slug} style={{ background: "#fff", border: "1px solid #e2ddd3", borderRadius: 18, padding: 22, boxShadow: "0 8px 24px rgba(20,36,58,.04)" }}>
                    <span style={{ color: "#9a793a", fontSize: 11, fontWeight: 900, letterSpacing: 1.3 }}>{guide.category.toUpperCase()}</span>
                    <h3 style={{ font: "700 23px/1.2 Georgia", color: "#0b2340", margin: "10px 0" }}>{guide.title}</h3>
                    <p style={{ color: "#697483", lineHeight: 1.55 }}>{guide.description}</p>
                    <Link href={`/conseils-juridiques/${guide.slug}`} style={{ color: "#0b2340", fontWeight: 900, textDecoration: "none" }}>Lire le guide →</Link>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </section>

      <section style={{ background: "#0b2340", color: "#fff", padding: "48px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ font: "700 34px Georgia", margin: "0 0 12px" }}>Votre situation est plus précise ?</h2>
          <p style={{ color: "#d5dbe4", lineHeight: 1.6 }}>Décrivez votre situation et transmettez vos documents depuis votre espace LEXIA.</p>
          <Link href="/inscription" style={{ display: "inline-block", marginTop: 12, background: "#d7bb76", color: "#0b2340", padding: "14px 20px", borderRadius: 12, textDecoration: "none", fontWeight: 900 }}>Ouvrir mon dossier</Link>
        </div>
      </section>
    </main>
  );
}
