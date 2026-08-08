"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function NouveauImpayePage() {
  const [creditorType, setCreditorType] = useState("professionnel");
  const [debtorType, setDebtorType] = useState("professionnel");
  const [debtorName, setDebtorName] = useState("");
  const [debtorEmail, setDebtorEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [origin, setOrigin] = useState("facture");
  const [reminders, setReminders] = useState("");

  function continueToCase(event: FormEvent) {
    event.preventDefault();
    const amountText = amount ? `${amount} €` : "montant à préciser";
    const description = [
      `Créance impayée de ${amountText}.`,
      `Origine : ${origin}.`,
      dueDate ? `Échéance : ${dueDate}.` : "Date d'échéance à préciser.",
      debtorName ? `Débiteur : ${debtorName}.` : "Identité du débiteur à compléter.",
      reminders ? `Relances déjà effectuées : ${reminders}.` : "Aucune relance renseignée à ce stade.",
    ].join(" ");

    const draft = {
      form: {
        accountType: creditorType === "professionnel" ? "professionnel" : "particulier",
        category: "entreprise",
        subject: `Impayé - ${origin}${debtorName ? ` - ${debtorName}` : ""}`,
        description,
        objective: "Obtenir le règlement de la somme due, prioritairement par une démarche amiable adaptée.",
        urgency: "normale",
        adverseKnown: Boolean(debtorName || debtorEmail),
        adverseType: debtorType,
        adverseName: debtorName,
        adverseEmail: debtorEmail,
        adversePhone: "",
      },
      selectedServiceIds: [],
      step: 2,
    };
    window.localStorage.setItem("lexia_case_draft_v2", JSON.stringify(draft));
    window.location.assign("/nouveau-dossier");
  }

  const field = {display:"grid",gap:7,fontSize:12,fontWeight:800,color:"#25364e"} as const;
  const input = {padding:"13px 14px",border:"1px solid #d8d1c4",borderRadius:11,fontSize:16,background:"white",color:"#0c2340"} as const;

  return <main style={{minHeight:"100vh",background:"#f6f3ed",color:"#0c2340",fontFamily:"Arial,sans-serif"}}>
    <header style={{background:"#0c2340",padding:"20px 5%",display:"flex",justifyContent:"space-between",alignItems:"center"}}><Link href="/impayes" style={{color:"white",fontFamily:"Georgia,serif",fontSize:34,fontWeight:900,textDecoration:"none"}}>LEXIA<span style={{color:"#dfbd6c"}}>.</span></Link><Link href="/impayes" style={{color:"#dfe7ef",textDecoration:"none",fontWeight:800}}>← Retour</Link></header>
    <section style={{maxWidth:820,margin:"0 auto",padding:"42px 18px 90px"}}>
      <span style={{color:"#a47e2c",fontWeight:900,letterSpacing:1.5,fontSize:12}}>LEXIA IMPAYÉS · PRÉ-DÉCLARATION</span>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(38px,7vw,62px)",margin:"10px 0 12px"}}>Déclarez votre impayé.</h1>
      <p style={{color:"#647184",fontSize:18,lineHeight:1.6,maxWidth:680}}>Renseignez les éléments essentiels. Ils seront automatiquement repris dans votre dossier LEXIA pour éviter de tout saisir une seconde fois.</p>

      <form onSubmit={continueToCase} style={{marginTop:28,background:"white",padding:"clamp(20px,4vw,34px)",borderRadius:22,border:"1px solid #e3ddd2",display:"grid",gap:20}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:16}}>
          <label style={field}>Vous êtes<select value={creditorType} onChange={e=>setCreditorType(e.target.value)} style={input}><option value="professionnel">Professionnel</option><option value="particulier">Particulier</option></select></label>
          <label style={field}>Type de débiteur<select value={debtorType} onChange={e=>setDebtorType(e.target.value)} style={input}><option value="professionnel">Entreprise / professionnel</option><option value="particulier">Particulier</option></select></label>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:16}}>
          <label style={field}>Nom du débiteur<input value={debtorName} onChange={e=>setDebtorName(e.target.value)} placeholder="Nom ou raison sociale" style={input}/></label>
          <label style={field}>E-mail du débiteur<input type="email" value={debtorEmail} onChange={e=>setDebtorEmail(e.target.value)} placeholder="contact@..." style={input}/></label>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16}}>
          <label style={field}>Montant restant dû<input inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9,.]/g,""))} placeholder="1250,00" style={input}/></label>
          <label style={field}>Date d'échéance<input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} style={input}/></label>
          <label style={field}>Origine<select value={origin} onChange={e=>setOrigin(e.target.value)} style={input}><option value="facture">Facture</option><option value="loyer">Loyer</option><option value="prestation">Prestation</option><option value="reconnaissance de dette">Reconnaissance de dette</option><option value="autre somme due">Autre somme due</option></select></label>
        </div>
        <label style={field}>Relances déjà effectuées<textarea rows={4} value={reminders} onChange={e=>setReminders(e.target.value)} placeholder="Ex. relance e-mail le 12/07, appel le 20/07..." style={{...input,resize:"vertical"}}/></label>
        <div style={{background:"#f8f5ef",padding:15,borderRadius:12,color:"#657080",lineHeight:1.55,fontSize:13}}>À l'étape suivante, vous pourrez compléter les faits, ajouter l'adresse postale du débiteur et joindre les factures, contrats, échanges et justificatifs.</div>
        <button type="submit" style={{border:0,borderRadius:12,background:"#0c2340",color:"white",padding:"16px 20px",fontSize:16,fontWeight:900,cursor:"pointer"}}>Continuer vers mon dossier →</button>
      </form>
    </section>
  </main>;
}
