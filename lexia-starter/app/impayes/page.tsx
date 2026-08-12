import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recouvrement amiable d'impayés en ligne",
  description: "Facture, loyer ou prestation impayée : constituez votre dossier LEXIA pour structurer une démarche de recouvrement amiable et suivre les échanges en ligne.",
  alternates: { canonical: "/impayes" },
  openGraph: { title: "LEXIA Impayés | Recouvrement amiable en ligne", description: "Structurez votre dossier d'impayé, vos justificatifs et vos démarches amiables avec LEXIA.", url: "/impayes", type: "website" },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "LEXIA Impayés",
  serviceType: "Accompagnement au recouvrement amiable d'impayés",
  areaServed: { "@type": "Country", name: "France" },
  provider: { "@type": "Organization", name: "LEXIA France", url: "https://lexiafrance.fr" },
  url: "https://lexiafrance.fr/impayes",
  description: "Service en ligne pour structurer un dossier de facture, loyer, prestation ou autre somme impayée et engager les démarches amiables adaptées.",
};

export default function ImpayesPage() {
  return (
    <main style={{minHeight:"100vh",background:"#f6f3ed",color:"#0c2340",fontFamily:"Arial, sans-serif"}}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}} />
      <header style={{background:"#0c2340",color:"white",padding:"22px 5%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,flexWrap:"wrap"}}><Link href="/" style={{color:"white",fontFamily:"Georgia,serif",fontSize:38,fontWeight:900,textDecoration:"none",letterSpacing:3}}>LEXIA<span style={{color:"#dfbd6c"}}>.</Link><Link href="/connexion" style={{color:"white",textDecoration:"none",fontWeight:800}}>Mon espace →</Link></header>
      <section style={{background:"#0c2340",color:"white",padding:"64px 5% 76px"}}><div style={{maxWidth:1050,margin:"auto"}}><span style={{color:"#dfbd6c",fontWeight:900,letterSpacing:2,fontSize:13}}>LEXIA IMPAYÉS · RECOUVREMENT AMIABLE</span><h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(44px,8vw,82px)",lineHeight:.98,maxWidth:900,margin:"20px 0"}}>Facture ou somme impayée ?<br/>Structurez votre démarche amiable.</h1><p style={{maxWidth:760,fontSize:20,lineHeight:1.65,color:"#d9e0e9"}}>Facture impayée, loyer, prestation, reconnaissance de dette ou autre somme restant due : rassemblez les informations et justificatifs utiles dans un dossier unique pour engager et suivre une démarche de recouvrement amiable.</p><div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:30}}><Link href="/impayes/nouveau" style={{background:"#dfbd6c",color:"#0c2340",padding:"16px 22px",borderRadius:12,textDecoration:"none",fontWeight:900}}>Déclarer un impayé</Link><a href="#parcours" style={{border:"1px solid #7d8da0",color:"white",padding:"16px 22px",borderRadius:12,textDecoration:"none",fontWeight:800}}>Comment ça marche ?</a></div></div></section>
      <section id="parcours" style={{maxWidth:1050,margin:"auto",padding:"58px 5%"}}><p style={{color:"#a47e2c",fontWeight:900,letterSpacing:2}}>RECOUVREMENT AMIABLE</p><h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(34px,5vw,55px)",margin:"8px 0 28px"}}>Un parcours structuré pour votre créance.</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>{[["01","Déposez la créance","Montant, origine, échéance, débiteur et justificatifs."],["02","Vérification du dossier","Analyse des éléments transmis et des pièces disponibles."],["03","Démarche amiable","Préparation d'une relance, proposition de règlement ou mise en demeure adaptée lorsque cela est pertinent."],["04","Suivi de la réponse","Paiement, échéancier, contestation ou absence de réponse sont consignés dans le dossier."],["05","Suite adaptée","Si l'amiable échoue, présentation des suites possibles et orientation vers un avocat ou commissaire de justice lorsque nécessaire."]].map(([n,t,d])=><article key={n} style={{background:"white",padding:24,borderRadius:18,border:"1px solid #e3ddd2"}}><b style={{color:"#c49b43",fontSize:14}}>{n}</b><h3 style={{fontSize:21,margin:"12px 0 8px"}}>{t}</h3><p style={{color:"#687385",lineHeight:1.55,margin:0}}>{d}</p></article>)}</div></section>
      <section style={{maxWidth:1050,margin:"0 auto",padding:"0 5% 60px"}}><div style={{background:"white",borderRadius:22,padding:"clamp(24px,5vw,46px)",border:"1px solid #e3ddd2"}}><p style={{color:"#a47e2c",fontWeight:900,letterSpacing:2}}>DOSSIER IMPAYÉ</p><h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(32px,5vw,48px)",margin:"8px 0 18px"}}>Les informations utiles dès le départ.</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:14,color:"#455164",lineHeight:1.6}}><div>✓ Identité du créancier et du débiteur</div><div>✓ Montant initial et solde restant</div><div>✓ Date d'échéance</div><div>✓ Facture, contrat ou justificatif</div><div>✓ Relances déjà réalisées</div><div>✓ Adresse postale et e-mail connus</div></div></div></section>
      <section style={{maxWidth:1050,margin:"0 auto",padding:"0 5% 60px"}}><div style={{padding:"30px",borderTop:"1px solid #d9d1c4"}}><h2 style={{fontFamily:"Georgia,serif",fontSize:32}}>Besoin d'abord de comprendre vos options ?</h2><p style={{lineHeight:1.7,color:"#566273"}}>Consultez nos guides juridiques ou utilisez l'orientation express pour identifier le parcours correspondant à votre situation.</p><div style={{display:"flex",gap:16,flexWrap:"wrap"}}><Link href="/conseils-juridiques" style={{color:"#0c2340",fontWeight:900}}>Guides juridiques →</Link><Link href="/orientation-juridique" style={{color:"#0c2340",fontWeight:900}}>Orientation express →</Link></div></div></section>
      <section style={{background:"#ead7a7",padding:"50px 5%"}}><div style={{maxWidth:1050,margin:"auto",display:"flex",justifyContent:"space-between",alignItems:"center",gap:25,flexWrap:"wrap"}}><div><b style={{letterSpacing:2,fontSize:12}}>LEXIA IMPAYÉS</b><h2 style={{fontFamily:"Georgia,serif",fontSize:38,margin:"8px 0"}}>Commencer votre dossier.</h2><p style={{maxWidth:650,lineHeight:1.6}}>L'ouverture d'un dossier ne garantit pas le recouvrement de la somme. Chaque situation est examinée selon les informations et justificatifs disponibles.</p></div><Link href="/impayes/nouveau" style={{background:"#0c2340",color:"white",padding:"17px 24px",borderRadius:12,textDecoration:"none",fontWeight:900}}>Déclarer mon impayé →</Link></div></section>
    </main>
  );
}
