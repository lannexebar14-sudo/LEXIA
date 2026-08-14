import type { Metadata } from "next";
import Link from "next/link";
import { seoGuides } from "../../lib/seo-guides";
import { extraSeoGuides } from "../../lib/seo-guides-extra";

const allGuides = [...seoGuides, ...extraSeoGuides];

export const metadata: Metadata = {
  title: "Conseil juridique en ligne : réponses à vos questions | LEXIA France",
  description: "Une question juridique ? Consultez les guides LEXIA France sur le logement, le travail, la famille, la consommation, les impayés et l'entreprise, puis déposez votre situation en ligne.",
  keywords: ["conseil juridique", "conseil juridique en ligne", "assistance juridique", "aide juridique", "question juridique", "réponse juridique", "LEXIA France"],
  alternates: { canonical: "/conseils-juridiques" },
  openGraph: {
    title: "Conseils juridiques en ligne | LEXIA France",
    description: "Des réponses pratiques aux questions juridiques courantes et un accès direct à l'assistance LEXIA.",
    url: "/conseils-juridiques",
    siteName: "LEXIA France",
    locale: "fr_FR",
    type: "website",
  },
};

const categories = ["Logement", "Travail", "Famille", "Consommation", "Entreprise", "Administration", "Démarches"];
const categorySlugs: Record<string, string> = { Logement:"logement", Travail:"travail", Famille:"famille", Consommation:"consommation", Entreprise:"entreprise", Administration:"administration" };
const commonQuestions = [
  ["Mon propriétaire ne rend pas ma caution : que faire ?", "/conseils-juridiques/depot-de-garantie-non-restitue"],
  ["Mon salaire n'est pas payé : quels recours ?", "/conseils-juridiques/salaire-impaye"],
  ["Comment récupérer une facture impayée ?", "/impayes"],
  ["Comment contester un licenciement ?", "/conseils-juridiques/contester-licenciement"],
  ["J'ai un litige : par où commencer ?", "/orientation-juridique"],
];

export default function ConseilsJuridiquesPage() {
  const structuredData = {"@context":"https://schema.org","@type":"CollectionPage",name:"Conseils juridiques en ligne - LEXIA France",description:"Guides et réponses pratiques aux questions juridiques courantes.",url:"https://lexiafrance.fr/conseils-juridiques",isPartOf:{"@type":"WebSite",name:"LEXIA France",url:"https://lexiafrance.fr"}};
  return <main style={{minHeight:"100vh",background:"#f5f2eb",color:"#14243a",fontFamily:"Arial, sans-serif"}}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData)}} />
    <header style={{background:"#0b2340",color:"#fff",padding:"22px 20px"}}><div style={{maxWidth:1120,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:18}}><Link href="/" style={{color:"#fff",textDecoration:"none",font:"700 30px Georgia"}}>LEXIA<span style={{color:"#d7bb76"}}>.</span></Link><Link href="/inscription" style={{background:"#d7bb76",color:"#0b2340",padding:"12px 16px",borderRadius:12,textDecoration:"none",fontWeight:900}}>Poser ma question</Link></div></header>
    <section style={{maxWidth:1120,margin:"0 auto",padding:"64px 20px 28px"}}><span style={{color:"#987636",fontSize:12,fontWeight:900,letterSpacing:1.8}}>ASSISTANCE & CONSEILS JURIDIQUES</span><h1 style={{maxWidth:900,font:"700 48px/1.08 Georgia",color:"#0b2340",margin:"12px 0 18px"}}>Une question juridique ? Commencez par trouver une réponse claire.</h1><p style={{maxWidth:850,fontSize:18,lineHeight:1.7,color:"#5d6978"}}>Logement, travail, famille, consommation, entreprise ou impayés : LEXIA France rassemble {allGuides.length} guides pour comprendre vos premiers recours, préparer les documents utiles et identifier la démarche adaptée. Pour une situation personnelle, vous pouvez ensuite transmettre votre dossier depuis votre espace sécurisé.</p><div style={{display:"flex",flexWrap:"wrap",gap:9,marginTop:24}}>{categories.map(category=>{const count=allGuides.filter(g=>g.category===category).length;if(!count)return null;const slug=categorySlugs[category];return slug?<Link key={category} href={`/conseils-juridiques/categorie/${slug}`} style={{background:"#fff",border:"1px solid #dfd8cc",color:"#0b2340",borderRadius:999,padding:"9px 13px",textDecoration:"none",fontWeight:800,fontSize:13}}>{category} · {count}</Link>:null})}</div></section>
    <section style={{maxWidth:1120,margin:"0 auto",padding:"8px 20px 32px"}}><div style={{background:"#fff",border:"1px solid #dfd8cc",borderRadius:22,padding:24}}><span style={{color:"#987636",fontSize:12,fontWeight:900,letterSpacing:1.4}}>QUESTIONS FRÉQUEMMENT RECHERCHÉES</span><h2 style={{font:"700 30px Georgia",margin:"10px 0 18px"}}>Que recherchez-vous ?</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:10}}>{commonQuestions.map(([q,url])=><Link key={q} href={url} style={{padding:"15px 16px",border:"1px solid #e7e1d7",borderRadius:14,color:"#0b2340",fontWeight:800,textDecoration:"none",lineHeight:1.4}}>{q} →</Link>)}</div></div></section>
    <section style={{maxWidth:1120,margin:"0 auto",padding:"0 20px 70px"}}>{categories.map(category=>{const guides=allGuides.filter(g=>g.category===category);if(!guides.length)return null;const slug=categorySlugs[category];return <section key={category} id={category.toLowerCase()} style={{marginTop:38,scrollMarginTop:24}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:12,marginBottom:16}}><h2 style={{font:"700 30px Georgia",color:"#0b2340",margin:0}}>{category}</h2>{slug?<Link href={`/conseils-juridiques/categorie/${slug}`} style={{color:"#667383",fontSize:13,fontWeight:800,textDecoration:"none"}}>Voir le domaine · {guides.length} guides →</Link>:null}</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>{guides.map(guide=><article key={guide.slug} style={{background:"#fff",border:"1px solid #e2ddd3",borderRadius:18,padding:22,boxShadow:"0 8px 24px rgba(20,36,58,.04)"}}><span style={{color:"#9a793a",fontSize:11,fontWeight:900,letterSpacing:1.3}}>{guide.category.toUpperCase()}</span><h3 style={{font:"700 23px/1.2 Georgia",color:"#0b2340",margin:"10px 0"}}>{guide.title}</h3><p style={{color:"#697483",lineHeight:1.55}}>{guide.description}</p><Link href={`/conseils-juridiques/${guide.slug}`} style={{color:"#0b2340",fontWeight:900,textDecoration:"none"}}>Voir la réponse →</Link></article>)}</div></section>})}</section>
    <section style={{background:"#0b2340",color:"#fff",padding:"48px 20px"}}><div style={{maxWidth:900,margin:"0 auto",textAlign:"center"}}><span style={{color:"#d7bb76",fontWeight:900,fontSize:12,letterSpacing:1.5}}>BESOIN D'UNE ASSISTANCE PERSONNALISÉE ?</span><h2 style={{font:"700 34px Georgia",margin:"10px 0 12px"}}>Votre question ne peut pas être résolue par un simple guide ?</h2><p style={{color:"#d5dbe4",lineHeight:1.6}}>Décrivez votre situation et transmettez les documents utiles à LEXIA France. Les contenus publics sont informatifs et ne remplacent pas l'étude personnalisée de votre dossier.</p><Link href="/inscription" style={{display:"inline-block",marginTop:12,background:"#d7bb76",color:"#0b2340",padding:"14px 20px",borderRadius:12,textDecoration:"none",fontWeight:900}}>Déposer ma question juridique</Link></div></section>
  </main>;
}
