"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { accountOpeningPrices, prestations, urgencySupplements } from "@/lib/prestations";
import { createClient } from "../../lib/supabase/client";
import "./nouveau-dossier.css";

type AccountType = keyof typeof accountOpeningPrices;
type Urgency = keyof typeof urgencySupplements;

type FormState = {
  accountType: AccountType;
  category: string;
  subject: string;
  description: string;
  objective: string;
  urgency: Urgency;
  adverseKnown: boolean;
  adverseType: string;
  adverseName: string;
  adverseEmail: string;
  adversePhone: string;
};

type CheckoutResult = {
  success?: boolean;
  url?: string;
  caseId?: string;
  reference?: string;
  amountCents?: number;
  error?: string;
};

const DRAFT_KEY = "lexia_case_checkout_draft_v1";
const CASE_KEY = "lexia_case_checkout_case_id_v1";

const defaultForm: FormState = {
  accountType: "particulier",
  category: "",
  subject: "",
  description: "",
  objective: "",
  urgency: "normale",
  adverseKnown: false,
  adverseType: "particulier",
  adverseName: "",
  adverseEmail: "",
  adversePhone: "",
};

const categories = [
  { icon: "⌂", value: "logement", label: "Logement", detail: "Bail, propriétaire, travaux, dépôt de garantie" },
  { icon: "◫", value: "travail", label: "Travail", detail: "Contrat, salaire, sanction, licenciement" },
  { icon: "◎", value: "consommation", label: "Consommation", detail: "Achat, remboursement, prestation contestée" },
  { icon: "◇", value: "assurance", label: "Assurance", detail: "Sinistre, indemnisation, refus de prise en charge" },
  { icon: "♙", value: "famille", label: "Famille", detail: "Séparation, pension, autorité parentale" },
  { icon: "▦", value: "entreprise", label: "Entreprise", detail: "Contrats, impayés, litiges commerciaux" },
  { icon: "⌖", value: "administration", label: "Administration", detail: "Décision, recours, contestation" },
  { icon: "+", value: "autre", label: "Autre situation", detail: "Décrivez librement votre demande" },
];

const urgencyOptions = [
  { value: "normale" as Urgency, label: "Traitement normal", surcharge: urgencySupplements.normale, detail: "Votre dossier suit le délai habituel de l’équipe." },
  { value: "rapide" as Urgency, label: "Priorité souhaitée", surcharge: urgencySupplements.rapide, detail: "La demande est signalée comme prioritaire." },
  { value: "urgente" as Urgency, label: "Échéance urgente", surcharge: urgencySupplements.urgente, detail: "Audience, délai ou échéance particulièrement proche." },
];

export default function NouveauDossierPage() {
  const supabase = useMemo(() => createClient(), []);
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutNotice, setCheckoutNotice] = useState("");

  useEffect(() => {
    const draft = window.localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as { form?: Partial<FormState>; selectedServiceIds?: string[]; step?: number };
        if (parsed.form) setForm({ ...defaultForm, ...parsed.form });
        if (Array.isArray(parsed.selectedServiceIds)) setSelectedServiceIds(parsed.selectedServiceIds);
        if (typeof parsed.step === "number") setStep(Math.min(5, Math.max(1, parsed.step)));
      } catch {
        window.localStorage.removeItem(DRAFT_KEY);
      }
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("paiement") === "annule") {
      setStep(5);
      setCheckoutNotice("Le paiement a été annulé. Aucun débit n’a été effectué. Vous pouvez vérifier le dossier puis réessayer.");
    }
  }, []);

  const urgency = urgencyOptions.find((option) => option.value === form.urgency)!;
  const selectedCategory = useMemo(() => categories.find((category) => category.value === form.category), [form.category]);
  const selectedServices = useMemo(() => prestations.filter((service) => selectedServiceIds.includes(service.id)), [selectedServiceIds]);
  const openingPrice = accountOpeningPrices[form.accountType] + urgency.surcharge;
  const servicesTotal = selectedServices.reduce((total, service) => total + service.price, 0);
  const totalPrice = openingPrice + servicesTotal;

  function persistDraft(nextStep = step) {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, selectedServiceIds, step: nextStep }));
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setCheckoutError("");
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    setFiles((current) => [...current, ...Array.from(event.target.files || [])].slice(0, 10));
  }

  function toggleService(serviceId: string) {
    setSelectedServiceIds((current) => current.includes(serviceId) ? current.filter((id) => id !== serviceId) : [...current, serviceId]);
  }

  function canContinue() {
    if (step === 1) return Boolean(form.category);
    if (step === 2) return form.subject.trim().length >= 5 && form.description.trim().length >= 40;
    return true;
  }

  function next() {
    if (!canContinue()) return;
    const nextStep = Math.min(5, step + 1);
    persistDraft(nextStep);
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    const previousStep = Math.max(1, step - 1);
    persistDraft(previousStep);
    setStep(previousStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checkoutLoading) return;

    setCheckoutLoading(true);
    setCheckoutError("");
    setCheckoutNotice("");
    persistDraft(5);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.assign("/connexion?redirect=/nouveau-dossier");
        return;
      }

      const caseId = window.localStorage.getItem(CASE_KEY) || undefined;
      const { data, error } = await supabase.functions.invoke<CheckoutResult>("create-stripe-checkout", {
        body: {
          caseId,
          accountType: form.accountType,
          category: form.category,
          subject: form.subject,
          description: form.description,
          objective: form.objective,
          urgency: form.urgency,
          adverseKnown: form.adverseKnown,
          adverseType: form.adverseType,
          adverseName: form.adverseName,
          adverseEmail: form.adverseEmail,
          adversePhone: form.adversePhone,
          selectedServiceIds,
          files: files.map((file) => ({ name: file.name, size: file.size, type: file.type })),
        },
      });

      if (error) throw new Error(error.message || "La page de paiement n’a pas pu être créée.");
      if (!data?.success || !data.url || !data.caseId) throw new Error(data?.error || "Stripe n’a pas retourné de page de paiement.");

      window.localStorage.setItem(CASE_KEY, data.caseId);
      window.location.assign(data.url);
    } catch (checkoutFailure) {
      setCheckoutError(checkoutFailure instanceof Error ? checkoutFailure.message : "Le paiement ne peut pas être ouvert pour le moment.");
      setCheckoutLoading(false);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }

  return (
    <main className="case-page">
      <header className="case-header">
        <Link href="/" className="case-logo">LEXIA<span>.</span></Link>
        <div className="case-header-actions"><Link href="/prestations">Voir les tarifs</Link><Link href="/tableau-de-bord">Mon espace</Link></div>
      </header>

      <section className="case-layout">
        <aside className="case-sidebar">
          <span className="case-sidebar-label">NOUVELLE DEMANDE</span>
          <h1>Déposez votre dossier en quelques étapes.</h1>
          <p>Chaque information nous aide à comprendre votre situation et à vous répondre plus précisément.</p>
          <div className="case-steps">
            {[[1, "Votre situation"], [2, "Les faits & urgence"], [3, "Partie adverse"], [4, "Documents"], [5, "Prestations & paiement"]].map(([number, label]) => (
              <div key={number} className={`case-step ${step === number ? "active" : ""} ${step > Number(number) ? "done" : ""}`}>
                <span>{step > Number(number) ? "✓" : number}</span>
                <div><b>{label}</b><small>Étape {number} sur 5</small></div>
              </div>
            ))}
          </div>
          <div className="case-price-card">
            <small>TOTAL SÉLECTIONNÉ</small>
            <strong>{totalPrice} €</strong>
            <p>{openingPrice} € d’ouverture{servicesTotal > 0 ? ` + ${servicesTotal} € de prestations` : ""}</p>
          </div>
        </aside>

        <section className="case-main">
          <div className="case-progress"><span style={{ width: `${step * 20}%` }} /></div>
          <form onSubmit={submit} className="case-form-card">
            {step === 1 && (
              <div className="case-section">
                <span className="case-eyebrow">ÉTAPE 1 · VOTRE SITUATION</span>
                <h2>Quel est le profil et le domaine de votre demande ?</h2>
                <p className="case-intro">Le tarif d’ouverture dépend du profil sélectionné. Choisissez ensuite la catégorie qui correspond le mieux à votre problème.</p>
                <div className="case-account-switch">
                  <button type="button" className={form.accountType === "particulier" ? "selected" : ""} onClick={() => update("accountType", "particulier")}>
                    <span>♙</span><div><b>Particulier</b><small>Ouverture à partir de 13 € TTC</small></div>
                  </button>
                  <button type="button" className={form.accountType === "professionnel" ? "selected" : ""} onClick={() => update("accountType", "professionnel")}>
                    <span>▦</span><div><b>Professionnel</b><small>Entreprise, indépendant ou association · 29 € TTC</small></div>
                  </button>
                </div>
                <div className="case-category-grid">
                  {categories.map((category) => (
                    <button key={category.value} type="button" className={form.category === category.value ? "selected" : ""} onClick={() => update("category", category.value)}>
                      <span>{category.icon}</span><div><b>{category.label}</b><small>{category.detail}</small></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="case-section">
                <span className="case-eyebrow">ÉTAPE 2 · LES FAITS & L’URGENCE</span>
                <h2>Expliquez-nous votre situation.</h2>
                <p className="case-intro">Décrivez les faits puis choisissez le niveau de traitement souhaité. Le supplément éventuel apparaît immédiatement.</p>
                <label className="case-field">Titre de votre demande<input value={form.subject} onChange={(event) => update("subject", event.target.value)} placeholder="Ex. Mon propriétaire refuse de rendre le dépôt de garantie" /></label>
                <label className="case-field">Décrivez votre situation<textarea rows={8} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Dates importantes, personnes concernées, démarches déjà effectuées…" /><small>{form.description.length} caractères · minimum 40</small></label>
                <label className="case-field">Quel résultat souhaitez-vous obtenir ?<textarea rows={4} value={form.objective} onChange={(event) => update("objective", event.target.value)} placeholder="Remboursement, courrier, contestation, mise en demeure…" /></label>
                <div className="urgency-title"><b>Choisissez votre niveau de traitement</b><span>Le supplément s’ajoute au tarif d’ouverture de votre profil.</span></div>
                <div className="urgency-grid">
                  {urgencyOptions.map((option) => (
                    <button type="button" key={option.value} className={form.urgency === option.value ? "selected" : ""} onClick={() => update("urgency", option.value)}>
                      <div><b>{option.label}</b><small>{option.detail}</small></div>
                      <strong>{option.surcharge === 0 ? "Inclus" : `+ ${option.surcharge} €`}</strong>
                      {form.urgency === option.value && <em>✓ Sélectionné</em>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="case-section">
                <span className="case-eyebrow">ÉTAPE 3 · PARTIE ADVERSE</span>
                <h2>Connaissez-vous la partie adverse ?</h2>
                <p className="case-intro">Cette partie reste facultative et pourra être complétée plus tard.</p>
                <div className="case-choice-row"><button type="button" className={form.adverseKnown ? "selected" : ""} onClick={() => update("adverseKnown", true)}>Oui, je la renseigne</button><button type="button" className={!form.adverseKnown ? "selected" : ""} onClick={() => update("adverseKnown", false)}>Non, continuer sans</button></div>
                {form.adverseKnown && <div className="case-adverse-grid"><label className="case-field">Type<select value={form.adverseType} onChange={(event) => update("adverseType", event.target.value)}><option value="particulier">Particulier</option><option value="entreprise">Entreprise</option><option value="administration">Administration</option><option value="avocat">Avocat ou représentant</option></select></label><label className="case-field">Nom ou raison sociale<input value={form.adverseName} onChange={(event) => update("adverseName", event.target.value)} /></label><label className="case-field">E-mail<input type="email" value={form.adverseEmail} onChange={(event) => update("adverseEmail", event.target.value)} /></label><label className="case-field">Téléphone<input value={form.adversePhone} onChange={(event) => update("adversePhone", event.target.value)} /></label></div>}
              </div>
            )}

            {step === 4 && (
              <div className="case-section">
                <span className="case-eyebrow">ÉTAPE 4 · DOCUMENTS</span>
                <h2>Ajoutez les pièces utiles.</h2>
                <p className="case-intro">Contrats, factures, courriers, captures, photos ou décisions.</p>
                <label className="case-upload-zone"><input type="file" multiple onChange={addFiles} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" /><span>⇧</span><b>Choisir des fichiers</b><small>PDF, Word, JPG ou PNG · 10 fichiers maximum</small></label>
                <div className="case-file-list">{files.length === 0 && <p>Aucun document ajouté.</p>}{files.map((file, index) => <div key={`${file.name}-${index}`}><span>▤</span><div><b>{file.name}</b><small>{Math.max(1, Math.round(file.size / 1024))} Ko</small></div><button type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}>Supprimer</button></div>)}</div>
                <p className="case-intro">Les fichiers pourront également être ajoutés depuis votre espace après le paiement.</p>
              </div>
            )}

            {step === 5 && (
              <div className="case-section">
                <span className="case-eyebrow">ÉTAPE 5 · PRESTATIONS & PAIEMENT</span>
                <h2>Vérifiez votre dossier avant le paiement sécurisé.</h2>
                <p className="case-intro">Les prestations sont facultatives. Le montant est recalculé et vérifié côté serveur avant l’ouverture de Stripe.</p>
                <div className="case-service-grid">
                  {prestations.map((service) => {
                    const selected = selectedServiceIds.includes(service.id);
                    return <button type="button" key={service.id} className={selected ? "selected" : ""} onClick={() => toggleService(service.id)}><span className="case-service-icon">{service.icon}</span><div><small>{service.category}</small><b>{service.shortTitle}</b><p>{service.description}</p></div><strong>{service.price} €</strong><em>{selected ? "✓ Ajoutée" : "+ Ajouter"}</em></button>;
                  })}
                </div>

                <h3 className="summary-title">Récapitulatif du dossier</h3>
                <div className="case-summary-grid">
                  <article><small>PROFIL</small><b>{form.accountType === "professionnel" ? "Professionnel" : "Particulier"}</b><span>Ouverture de base : {accountOpeningPrices[form.accountType]} €</span></article>
                  <article><small>DOMAINE</small><b>{selectedCategory?.label || "Non renseigné"}</b><span>{form.category}</span></article>
                  <article><small>NIVEAU</small><b>{urgency.label}</b><span>{urgency.surcharge === 0 ? "Inclus" : `Supplément : ${urgency.surcharge} €`}</span></article>
                  <article><small>PRESTATIONS</small><b>{selectedServices.length} sélectionnée{selectedServices.length > 1 ? "s" : ""}</b><span>{servicesTotal} € TTC</span></article>
                  <article className="wide"><small>OBJET</small><b>{form.subject}</b><span>{form.description}</span></article>
                  <article><small>PARTIE ADVERSE</small><b>{form.adverseKnown ? form.adverseName || "À compléter" : "Non renseignée"}</b><span>Facultatif</span></article>
                  <article><small>DOCUMENTS</small><b>{files.length} fichier{files.length > 1 ? "s" : ""}</b><span>Ajout possible plus tard</span></article>
                </div>

                <div className="case-price-breakdown">
                  <div><span>Ouverture du dossier</span><b>{openingPrice} €</b></div>
                  {selectedServices.map((service) => <div key={service.id}><span>{service.shortTitle}</span><b>{service.price} €</b></div>)}
                </div>
                <div className="case-payment-summary"><div><small>TOTAL À PAYER</small><b>Paiement sécurisé par Stripe</b></div><strong>{totalPrice} € TTC</strong></div>
                <p className="qualified-note">Le paiement n’est considéré comme reçu qu’après confirmation sécurisée de Stripe. Les prestations de consultation personnalisée ou de rédaction juridique sont prises en charge ou validées par un professionnel juridiquement habilité selon la nature du dossier.</p>
                <label className="case-consent"><input type="checkbox" required /><span>Je confirme l’exactitude des informations transmises et accepte les conditions du service.</span></label>
                {checkoutNotice && <div className="case-checkout-notice">{checkoutNotice}</div>}
                {checkoutError && <div className="case-checkout-error" role="alert">{checkoutError}</div>}
              </div>
            )}

            <div className="case-navigation"><button type="button" className="case-back" onClick={back} disabled={step === 1 || checkoutLoading}>← Précédent</button>{step < 5 ? <button type="button" className="case-next" onClick={next} disabled={!canContinue()}>Continuer →</button> : <button type="submit" className="case-next" disabled={checkoutLoading}>{checkoutLoading ? "Ouverture du paiement…" : `Payer ${totalPrice} € avec Stripe →`}</button>}</div>
          </form>
        </section>
      </section>
    </main>
  );
}
