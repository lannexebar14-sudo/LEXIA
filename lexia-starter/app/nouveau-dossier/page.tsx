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

type CreateCaseResult = {
  success?: boolean;
  caseId?: string;
  reference?: string;
  status?: string;
  error?: string;
};

const DRAFT_KEY = "lexia_case_draft_v2";
const SUBMISSION_TOKEN_KEY = "lexia_case_submission_token_v1";

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

async function functionErrorMessage(error: unknown, fallback: string) {
  const candidate = error as { message?: string; context?: Response };
  if (candidate?.context) {
    try {
      const body = await candidate.context.clone().json() as { error?: string };
      if (body.error) return body.error;
    } catch {
      // La réponse technique n'est pas toujours lisible en JSON.
    }
  }
  return candidate?.message && !candidate.message.includes("non-2xx") ? candidate.message : fallback;
}

function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 160) || "document";
}

export default function NouveauDossierPage() {
  const supabase = useMemo(() => createClient(), []);
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  useEffect(() => {
    const draft = window.localStorage.getItem(DRAFT_KEY);
    if (!draft) return;
    try {
      const parsed = JSON.parse(draft) as { form?: Partial<FormState>; selectedServiceIds?: string[]; step?: number };
      if (parsed.form) setForm({ ...defaultForm, ...parsed.form });
      if (Array.isArray(parsed.selectedServiceIds)) setSelectedServiceIds(parsed.selectedServiceIds);
      if (typeof parsed.step === "number") setStep(Math.min(5, Math.max(1, parsed.step)));
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
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
    setSubmissionError("");
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files || []);
    const valid = incoming.filter((file) => file.size <= 15 * 1024 * 1024);
    if (valid.length !== incoming.length) setSubmissionError("Chaque document doit faire moins de 15 Mo.");
    setFiles((current) => [...current, ...valid].slice(0, 10));
    event.target.value = "";
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

  async function uploadDocuments(userId: string, caseId: string) {
    const failed: string[] = [];

    for (const file of files) {
      const storagePath = `${userId}/${caseId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("case-documents")
        .upload(storagePath, file, { contentType: file.type || undefined, upsert: false });

      if (uploadError) {
        failed.push(file.name);
        continue;
      }

      const { error: registerError } = await supabase.from("legal_case_documents").insert({
        case_id: caseId,
        user_id: userId,
        storage_path: storagePath,
        original_name: file.name,
        mime_type: file.type || null,
        size_bytes: file.size,
      });

      if (registerError) {
        await supabase.storage.from("case-documents").remove([storagePath]);
        failed.push(file.name);
      }
    }

    return failed;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionLoading) return;

    setSubmissionLoading(true);
    setSubmissionError("");
    persistDraft(5);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.assign("/connexion?redirect=/nouveau-dossier");
        return;
      }

      let submissionToken = window.localStorage.getItem(SUBMISSION_TOKEN_KEY);
      if (!submissionToken) {
        submissionToken = crypto.randomUUID();
        window.localStorage.setItem(SUBMISSION_TOKEN_KEY, submissionToken);
      }

      const { data, error } = await supabase.functions.invoke<CreateCaseResult>("create-legal-case", {
        body: {
          submissionToken,
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

      if (error) throw new Error(await functionErrorMessage(error, "Le dossier n’a pas pu être transmis."));
      if (!data?.success || !data.caseId) throw new Error(data?.error || "Le serveur n’a pas confirmé la création du dossier.");

      const failedDocuments = await uploadDocuments(user.id, data.caseId);
      window.localStorage.removeItem(DRAFT_KEY);
      window.localStorage.removeItem(SUBMISSION_TOKEN_KEY);

      const documentState = failedDocuments.length > 0 ? "&documents=incomplets" : "";
      window.location.assign(`/tableau-de-bord/dossiers/${data.caseId}?depot=confirme${documentState}`);
    } catch (failure) {
      setSubmissionError(failure instanceof Error ? failure.message : "Le dossier ne peut pas être transmis pour le moment.");
      setSubmissionLoading(false);
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
            {[[1, "Votre situation"], [2, "Les faits & urgence"], [3, "Partie adverse"], [4, "Documents"], [5, "Validation & transmission"]].map(([number, label]) => (
              <div key={number} className={`case-step ${step === number ? "active" : ""} ${step > Number(number) ? "done" : ""}`}>
                <span>{step > Number(number) ? "✓" : number}</span>
                <div><b>{label}</b><small>Étape {number} sur 5</small></div>
              </div>
            ))}
          </div>
          <div className="case-price-card">
            <small>MONTANT INDICATIF</small>
            <strong>{totalPrice} €</strong>
            <p>Le paiement en ligne sera activé prochainement.</p>
          </div>
        </aside>

        <section className="case-main">
          <div className="case-progress"><span style={{ width: `${step * 20}%` }} /></div>
          <form onSubmit={submit} className="case-form-card">
            {step === 1 && (
              <div className="case-section">
                <span className="case-eyebrow">ÉTAPE 1 · VOTRE SITUATION</span>
                <h2>Quel est le profil et le domaine de votre demande ?</h2>
                <p className="case-intro">Choisissez le profil puis la catégorie qui correspond le mieux à votre situation.</p>
                <div className="case-account-switch">
                  <button type="button" className={form.accountType === "particulier" ? "selected" : ""} onClick={() => update("accountType", "particulier")}><span>♙</span><div><b>Particulier</b><small>Ouverture prévue à partir de 13 € TTC</small></div></button>
                  <button type="button" className={form.accountType === "professionnel" ? "selected" : ""} onClick={() => update("accountType", "professionnel")}><span>▦</span><div><b>Professionnel</b><small>Entreprise, indépendant ou association · 29 € TTC</small></div></button>
                </div>
                <div className="case-category-grid">
                  {categories.map((category) => <button key={category.value} type="button" className={form.category === category.value ? "selected" : ""} onClick={() => update("category", category.value)}><span>{category.icon}</span><div><b>{category.label}</b><small>{category.detail}</small></div></button>)}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="case-section">
                <span className="case-eyebrow">ÉTAPE 2 · LES FAITS & L’URGENCE</span>
                <h2>Expliquez-nous votre situation.</h2>
                <p className="case-intro">Décrivez les faits puis indiquez le niveau d’urgence.</p>
                <label className="case-field">Titre de votre demande<input value={form.subject} onChange={(event) => update("subject", event.target.value)} placeholder="Ex. Mon propriétaire refuse de rendre le dépôt de garantie" /></label>
                <label className="case-field">Décrivez votre situation<textarea rows={8} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Dates importantes, personnes concernées, démarches déjà effectuées…" /><small>{form.description.length} caractères · minimum 40</small></label>
                <label className="case-field">Quel résultat souhaitez-vous obtenir ?<textarea rows={4} value={form.objective} onChange={(event) => update("objective", event.target.value)} placeholder="Remboursement, courrier, contestation, mise en demeure…" /></label>
                <div className="urgency-title"><b>Choisissez votre niveau de traitement</b><span>Le niveau choisi apparaîtra clairement dans l’administration.</span></div>
                <div className="urgency-grid">
                  {urgencyOptions.map((option) => <button type="button" key={option.value} className={form.urgency === option.value ? "selected" : ""} onClick={() => update("urgency", option.value)}><div><b>{option.label}</b><small>{option.detail}</small></div><strong>{option.surcharge === 0 ? "Inclus" : `+ ${option.surcharge} €`}</strong>{form.urgency === option.value && <em>✓ Sélectionné</em>}</button>)}
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
                <p className="case-intro">Les documents seront transférés dans un espace privé après la validation du dossier.</p>
                <label className="case-upload-zone"><input type="file" multiple onChange={addFiles} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" /><span>⇧</span><b>Choisir des fichiers</b><small>PDF, Word, JPG ou PNG · 15 Mo maximum · 10 fichiers</small></label>
                <div className="case-file-list">{files.length === 0 && <p>Aucun document ajouté.</p>}{files.map((file, index) => <div key={`${file.name}-${index}`}><span>▤</span><div><b>{file.name}</b><small>{Math.max(1, Math.round(file.size / 1024))} Ko</small></div><button type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}>Supprimer</button></div>)}</div>
                <p className="case-intro">Vous pourrez ajouter d’autres documents depuis votre dossier ultérieurement.</p>
              </div>
            )}

            {step === 5 && (
              <div className="case-section">
                <span className="case-eyebrow">ÉTAPE 5 · VALIDATION & TRANSMISSION</span>
                <h2>Vérifiez votre dossier avant de le transmettre.</h2>
                <p className="case-intro">Le dossier sera immédiatement enregistré et visible dans votre espace ainsi que dans l’administration.</p>
                <div className="case-service-grid">
                  {prestations.map((service) => {
                    const selected = selectedServiceIds.includes(service.id);
                    return <button type="button" key={service.id} className={selected ? "selected" : ""} onClick={() => toggleService(service.id)}><span className="case-service-icon">{service.icon}</span><div><small>{service.category}</small><b>{service.shortTitle}</b><p>{service.description}</p></div><strong>{service.price} €</strong><em>{selected ? "✓ Ajoutée" : "+ Ajouter"}</em></button>;
                  })}
                </div>

                <h3 className="summary-title">Récapitulatif du dossier</h3>
                <div className="case-summary-grid">
                  <article><small>PROFIL</small><b>{form.accountType === "professionnel" ? "Professionnel" : "Particulier"}</b><span>Ouverture prévue : {accountOpeningPrices[form.accountType]} €</span></article>
                  <article><small>DOMAINE</small><b>{selectedCategory?.label || "Non renseigné"}</b><span>{form.category}</span></article>
                  <article><small>NIVEAU</small><b>{urgency.label}</b><span>{urgency.surcharge === 0 ? "Inclus" : `Supplément prévu : ${urgency.surcharge} €`}</span></article>
                  <article><small>PRESTATIONS</small><b>{selectedServices.length} sélectionnée{selectedServices.length > 1 ? "s" : ""}</b><span>{servicesTotal} € TTC</span></article>
                  <article className="wide"><small>OBJET</small><b>{form.subject}</b><span>{form.description}</span></article>
                  <article><small>PARTIE ADVERSE</small><b>{form.adverseKnown ? form.adverseName || "À compléter" : "Non renseignée"}</b><span>Facultatif</span></article>
                  <article><small>DOCUMENTS</small><b>{files.length} fichier{files.length > 1 ? "s" : ""}</b><span>Stockage privé</span></article>
                </div>

                <div className="case-price-breakdown"><div><span>Ouverture du dossier</span><b>{openingPrice} €</b></div>{selectedServices.map((service) => <div key={service.id}><span>{service.shortTitle}</span><b>{service.price} €</b></div>)}</div>
                <div className="case-payment-summary"><div><small>MONTANT INDICATIF</small><b>Paiement en ligne bientôt disponible</b></div><strong>{totalPrice} € TTC</strong></div>
                <p className="qualified-note">Votre dossier peut être transmis dès maintenant sans paiement. L’administration pourra l’examiner et vous serez informé lorsque la solution de paiement LEXIA sera activée.</p>
                <label className="case-consent"><input type="checkbox" required /><span>Je confirme l’exactitude des informations transmises et accepte les conditions du service.</span></label>
                {submissionError && <div className="case-checkout-error" role="alert">{submissionError}</div>}
              </div>
            )}

            <div className="case-navigation"><button type="button" className="case-back" onClick={back} disabled={step === 1 || submissionLoading}>← Précédent</button>{step < 5 ? <button type="button" className="case-next" onClick={next} disabled={!canContinue()}>Continuer →</button> : <button type="submit" className="case-next" disabled={submissionLoading}>{submissionLoading ? "Transmission en cours…" : "Transmettre mon dossier →"}</button>}</div>
          </form>
        </section>
      </section>
    </main>
  );
}
