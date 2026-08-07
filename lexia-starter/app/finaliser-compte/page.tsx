"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function FinaliserComptePage(){
 const router=useRouter(); const supabase=useMemo(()=>createClient(),[]);
 const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState(""); const [phone,setPhone]=useState(""); const [address,setAddress]=useState(""); const [postalCode,setPostalCode]=useState(""); const [city,setCity]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [loading,setLoading]=useState(true); const [email,setEmail]=useState(""); const [fullName,setFullName]=useState("");

 useEffect(()=>{(async()=>{
  setError("");
  try{
   const hash=new URLSearchParams(window.location.hash.replace(/^#/,""));
   const accessToken=hash.get("access_token"); const refreshToken=hash.get("refresh_token");
   if(accessToken&&refreshToken){
    const {error:sessionError}=await supabase.auth.setSession({access_token:accessToken,refresh_token:refreshToken});
    if(sessionError){setError("Le lien d’invitation est invalide ou expiré. Demandez une nouvelle invitation à LEXIA.");setLoading(false);return;}
    window.history.replaceState({},"",window.location.pathname);
   }
   const {data:{user}}=await supabase.auth.getUser();
   if(!user){setError("Le lien d’invitation est invalide ou expiré. Demandez une nouvelle invitation à LEXIA.");setLoading(false);return;}
   setEmail(user.email||""); setFullName(String(user.user_metadata?.full_name||"")); setLoading(false);
  }catch{setError("Impossible d’ouvrir votre invitation. Réessayez depuis le lien reçu par e-mail.");setLoading(false);}
 })()},[supabase]);

 async function submit(e:FormEvent){e.preventDefault(); if(password!==confirm){setError("Les mots de passe ne correspondent pas.");return;} if(password.length<8){setError("Le mot de passe doit contenir au moins 8 caractères.");return;} setBusy(true);setError(""); const {data,error:fnError}=await supabase.functions.invoke("finalize-invited-client",{body:{password,phone,addressLine1:address,postalCode,city}}); if(fnError||!(data as any)?.success){setError((data as any)?.error||fnError?.message||"Votre fiche n’a pas pu être finalisée.");setBusy(false);return;} router.replace("/nouveau-dossier?invitation=1");}

 if(loading)return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f4f1e9",fontFamily:"Arial"}}>Ouverture de votre invitation LEXIA…</main>;
 return <main style={{minHeight:"100vh",background:"#f4f1e9",padding:"30px 16px",fontFamily:"Arial"}}><section style={{maxWidth:680,margin:"0 auto",background:"#fff",border:"1px solid #e3ddd1",borderRadius:24,overflow:"hidden"}}><header style={{background:"#0b2340",padding:"26px 32px",color:"#fff",font:"700 30px Georgia"}}>LEXIA<span style={{color:"#d7bb76"}}>.</span></header><div style={{height:5,background:"#d7bb76"}}/><form onSubmit={submit} style={{padding:32,display:"grid",gap:16}}><small style={{color:"#9a7a39",fontWeight:900,letterSpacing:1.5}}>FINALISATION DE VOTRE ESPACE</small><h1 style={{font:"700 38px Georgia",color:"#0b2340",margin:"0 0 8px"}}>Complétez votre fiche client</h1><p style={{color:"#667085",lineHeight:1.6,marginTop:0}}>Choisissez votre mot de passe puis renseignez vos coordonnées. Une fois cette étape terminée, vous pourrez décrire vous-même votre situation et transmettre votre demande à LEXIA.</p>{fullName&&<label style={{display:"grid",gap:7,fontWeight:800}}>Nom et prénom<input value={fullName} readOnly style={{padding:14,borderRadius:12,border:"1px solid #d8d2c8",background:"#f6f7f8"}} /></label>}{email&&<label style={{display:"grid",gap:7,fontWeight:800}}>Adresse e-mail<input value={email} readOnly style={{padding:14,borderRadius:12,border:"1px solid #d8d2c8",background:"#f6f7f8"}} /></label>}<label style={{display:"grid",gap:7,fontWeight:800}}>Mot de passe<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} autoComplete="new-password" style={{padding:14,borderRadius:12,border:"1px solid #d8d2c8"}} /></label><label style={{display:"grid",gap:7,fontWeight:800}}>Confirmer le mot de passe<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={8} autoComplete="new-password" style={{padding:14,borderRadius:12,border:"1px solid #d8d2c8"}} /></label><label style={{display:"grid",gap:7,fontWeight:800}}>Numéro de téléphone<input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} required style={{padding:14,borderRadius:12,border:"1px solid #d8d2c8"}} /></label><label style={{display:"grid",gap:7,fontWeight:800}}>Adresse postale<input value={address} onChange={e=>setAddress(e.target.value)} required style={{padding:14,borderRadius:12,border:"1px solid #d8d2c8"}} /></label><div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:12}}><label style={{display:"grid",gap:7,fontWeight:800}}>Code postal<input value={postalCode} onChange={e=>setPostalCode(e.target.value)} required inputMode="numeric" style={{padding:14,borderRadius:12,border:"1px solid #d8d2c8"}} /></label><label style={{display:"grid",gap:7,fontWeight:800}}>Ville<input value={city} onChange={e=>setCity(e.target.value)} required style={{padding:14,borderRadius:12,border:"1px solid #d8d2c8"}} /></label></div>{error&&<div style={{padding:13,borderRadius:12,background:"#fdecec",color:"#9e2d2d",fontWeight:700}}>{error}</div>}<button disabled={busy||!!error&&!email} style={{padding:16,border:0,borderRadius:14,background:"#0b2340",color:"#fff",fontWeight:900,fontSize:16}}>{busy?"Enregistrement…":"Finaliser et décrire ma situation"}</button></form></section></main>;
}
