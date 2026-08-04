"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import "./nouveau-dossier.css";

type AccountType = "particulier" | "professionnel";

type FormState = {
  accountType: AccountType;
  category: string;
  subject: string;
  description: string;
  objective: string;
  urgency: string;
  adverseKnown: boolean;
  adverseType: string;
  adverseName: string;
  adverseEmail: string;
  adversePhone: string;
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

export default function NouveauDossierPage() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
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
  });

  const price = form.accountType === "professionnel" ? 29 : 13;
  const selectedCategory = useMemo(
    () => categories.find((category) => category.value === form.category),
    [form.category]
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);
    setFiles((current) => [...current, ...selected].slice(0, 10));
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }

  function canContinue() {
    if (step === 1) return Boolean(form.category);
    if (step === 2) return form.subject.trim().length >= 5 && form.description.trim().length >= 40;
    return true;
  }

  function nextStep() {
    if (!canContinue()) return;
    setStep((current) => Math.min(5, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previousStep() {
    setStep((current) => Math.max(1, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <main className="case-success-page">
        <section className="case-success-card">
          <div className="case-success-icon">✓</div>
          <span>DEMANDE PRÉPARÉE</span>
          <h1>Votre dossier est prêt à être transmis.</h1>
          <p>
            Le parcours est terminé. La prochaine étape du développement permettra d’enregistrer définitivement le dossier dans votre espace et de procéder au paiement sécurisé de {price} €.
          </p>
          <div className="case-success-actions">
            <Link href="/tableau-de-bord">Retour à mon espace</Link>
            <button onClick={() => setSubmitted(false)}>Modifier ma demande</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="case-page">
      <header className="case-header">
        <Link href="/" className="case-logo">LEXIA<span>.</span></Link>
        <div className="case-header-actions">
          <span>Besoin d’aide ?</span>
          <Link href="/tableau-de-bord">Mon espace</Link>
        </div>
      </header>

      <section className="case-layout">
        <aside className="case-sidebar">
          <span className="case-sidebar-label">NOUVELLE DEMANDE</span>
          <h1>Déposez votre dossier en quelques étapes.</h1>
          <p>Chaque information nous aide à comprendre votre situation et à vous répondre plus précisément.</p>

          <div className="case-steps">
            {[
              [1, "Votre situation"],
              [2, "Les faits"],
              [3, "Partie adverse"],
              [4, "Documents"],
              [5, "Récapitulatif"],
            ].map(([number, label]) => (
              <div key={number} className={`case-step ${step === number ? "active" : ""} ${step > Number(number) ? "done" : ""}`}>
                <span>{step > Number(number) ? "✓" : number}</span>
                <div><b>{label}</b><small>Étape {number} sur 5</small></div>
              </div>
            ))}
          </div>

          <div className="case-price-card">
            <small>TARIF D’OUVERTURE</small>
            <strong>{price} €</strong>
            <p>{form.accountType === "professionnel" ? "Tarif professionnel" : "Tarif particulier"}</p>
          </div>
        </aside>

        <section className="case-main">
          <div className="case-progress"><span style={{ width: `${step * 20}%` }} /></div>

          <form onSubmit={submit} className="case-form-card">
            {step === 1 && (
              <div className="case-section">
                <span className="case-eyebrow">ÉTAPE 1 · VOTRE SITUATION</span>
                <h2>Quel type de demande souhaitez-vous déposer ?</h2>
                <p className="case-intro">Choisissez votre profil puis le domaine qui correspond le mieux à votre problème.</p>

                <div className="case-account-switch">
                  <button type="button" className={form.accountType === "particulier" ? "selected" : ""} onClick={() => updateField("accountType", "particulier")}>
                    <span>♙</span><div><b>Particulier</b><small>Ouverture du dossier : 13 €</small></div>
                  </button>
                  <button type="button" className={form.accountType === "professionnel" ? "selected" : ""} onClick={() => updateField("accountType", "professionnel")}>
                    <span>▦</span><div><b>Professionnel</b><small>Avec SIRET · ouverture : 29 €</small></div>
                  </button>
                </div>

                <div className="case-category-grid">
                  {categories.map((category) => (
                    <button key={category.value} type="button" className={form.category === category.value ? "selected" : ""} onClick={() => updateField("category", category.value)}>
                      <span>{category.icon}</span>
                      <div><b>{category.label}</b><small>{category.detail}</small></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="case-section">
                <span className="case-eyebrow">ÉTAPE 2 · LES FAITS</span>
                <h2>Expliquez-nous ce qu’il s’est passé.</h2>
                <p className="case-intro">Restez chronologique et précis. Vous pourrez transmettre les justificatifs à l’étape suivante.</p>

                <label className="case-field">Titre de votre demande
                  <input value={form.subject} onChange={(event) => updateField("subject", event.target.value)} placeholder="Ex. Mon propriétaire refuse de rendre le dépôt de garantie" />
                </label>
                <label className="case-field">Décrivez votre situation
                  <textarea rows={9} value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Indiquez les dates importantes, les personnes concernées, les démarches déjà effectuées et les réponses reçues…" />
                  <small>{form.description.length} caractères · minimum conseillé : 40</small>
                </label>
                <label className="case-field">Quel résultat souhaitez-vous obtenir ?
                  <textarea rows={4} value={form.objective} onChange={(event) => updateField("objective", event.target.value)} placeholder="Ex. Obtenir un remboursement, rédiger une mise en demeure, contester une décision…" />
                </label>
                <label className="case-field">Niveau d’urgence
                  <select value={form.urgency} onChange={(event) => updateField("urgency", event.target.value)}>
                    <option value="normale">Normale</option>
                    <option value="rapide">Réponse rapide souhaitée</option>
                    <option value="urgente">Urgente · délai ou audience proche</option>
                  </select>
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="case-section">
                <span className="case-eyebrow">ÉTAPE 3 · PARTIE ADVERSE</span>
                <h2>Connaissez-vous la partie adverse ?</h2>
                <p className="case-intro">Cette partie est facultative. Elle peut être complétée plus tard dans la messagerie.</p>

                <div className="case-choice-row">
                  <button type="button" className={form.adverseKnown ? "selected" : ""} onClick={() => updateField("adverseKnown", true)}>Oui, je souhaite la renseigner</button>
                  <button type="button" className={!form.adverseKnown ? "selected" : ""} onClick={() => updateField("adverseKnown", false)}>Non, je continuerai sans</button>
                </div>

                {form.adverseKnown && (
                  <div className="case-adverse-grid">
                    <label className="case-field">Type
                      <select value={form.adverseType} onChange={(event) => updateField("adverseType", event.target.value)}>
                        <option value="particulier">Particulier</option>
                        <option value="entreprise">Entreprise</option>
                        <option value="administration">Administration</option>
                        <option value="avocat">Avocat ou représentant</option>
                      </select>
                    </label>
                    <label className="case-field">Nom ou raison sociale
                      <input value={form.adverseName} onChange={(event) => updateField("adverseName", event.target.value)} placeholder="Nom de la personne ou de l’organisme" />
                    </label>
                    <label className="case-field">Adresse e-mail
                      <input type="email" value={form.adverseEmail} onChange={(event) => updateField("adverseEmail", event.target.value)} placeholder="Facultatif" />
                    </label>
                    <label className="case-field">Téléphone
                      <input value={form.adversePhone} onChange={(event) => updateField("adversePhone", event.target.value)} placeholder="Facultatif" />
                    </label>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="case-section">
                <span className="case-eyebrow">ÉTAPE 4 · DOCUMENTS</span>
                <h2>Ajoutez les pièces utiles.</h2>
                <p className="case-intro">Contrats, factures, courriers, captures d’écran, photos ou décisions. Jusqu’à 10 fichiers pour cette première version.</p>

                <label className="case-upload-zone">
                  <input type="file" multiple onChange={addFiles} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                  <span>⇧</span>
                  <b>Choisir des fichiers</b>
                  <small>PDF, Word, JPG ou PNG</small>
                </label>

                <div className="case-file-list">
                  {files.length === 0 && <p>Aucun document ajouté pour le moment.</p>}
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`}><span>▤</span><div><b>{file.name}</b><small>{Math.max(1, Math.round(file.size / 1024))} Ko</small></div><button type="button" onClick={() => removeFile(index)}>Supprimer</button></div>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="case-section">
                <span className="case-eyebrow">ÉTAPE 5 · RÉCAPITULATIF</span>
                <h2>Vérifiez votre demande avant transmission.</h2>
                <p className="case-intro">Vous pourrez toujours compléter votre dossier après son ouverture.</p>

                <div className="case-summary-grid">
                  <article><small>PROFIL</small><b>{form.accountType === "professionnel" ? "Professionnel" : "Particulier"}</b><span>{price} €</span></article>
                  <article><small>DOMAINE</small><b>{selectedCategory?.label || "Non renseigné"}</b><span>{form.urgency}</span></article>
                  <article className="wide"><small>OBJET</small><b>{form.subject || "Non renseigné"}</b><span>{form.description || "Aucune description"}</span></article>
                  <article><small>PARTIE ADVERSE</small><b>{form.adverseKnown ? form.adverseName || "À compléter" : "Non renseignée"}</b><span>Facultatif</span></article>
                  <article><small>DOCUMENTS</small><b>{files.length} fichier{files.length > 1 ? "s" : ""}</b><span>Ajout possible plus tard</span></article>
                </div>

                <div className="case-payment-summary">
                  <div><small>OUVERTURE DU DOSSIER</small><b>Analyse initiale et accès à la messagerie</b></div>
                  <strong>{price} € TTC</strong>
                </div>

                <label className="case-consent"><input type="checkbox" required /><span>Je confirme l’exactitude des informations transmises et j’accepte que cette demande soit analysée selon les conditions du service.</span></label>
              </div>
            )}

            <div className="case-navigation">
              <button type="button" className="case-back" onClick={previousStep} disabled={step === 1}>← Précédent</button>
              {step < 5 ? (
                <button type="button" className="case-next" onClick={nextStep} disabled={!canContinue()}>Continuer →</button>
              ) : (
                <button type="submit" className="case-next">Transmettre ma demande →</button>
              )}
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
