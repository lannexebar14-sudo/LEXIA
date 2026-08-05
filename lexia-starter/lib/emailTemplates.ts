export type LexiaEmailTemplate = {
  id: string;
  label: string;
  category: "auth" | "security" | "transactional";
  supabaseTemplate?: string;
  subject: string;
  description: string;
  html: string;
};

type EmailLayoutOptions = {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  actionLabel?: string;
  actionUrl?: string;
  code?: string;
  content?: string;
  warning?: string;
  footerNote?: string;
};

const COLORS = {
  navy: "#0b223d",
  navySoft: "#163b64",
  gold: "#d7bb76",
  goldSoft: "#f4ecd8",
  text: "#26364a",
  muted: "#697586",
  border: "#dfe4eb",
  background: "#eef1f5",
  white: "#ffffff",
};

function emailLayout({
  preheader,
  eyebrow,
  title,
  intro,
  actionLabel,
  actionUrl,
  code,
  content = "",
  warning,
  footerNote = "Cet e-mail a été envoyé automatiquement par LEXIA. Merci de ne pas y répondre directement.",
}: EmailLayoutOptions) {
  const action = actionLabel && actionUrl
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:30px auto 24px;"><tr><td align="center" bgcolor="${COLORS.navy}" style="border-radius:14px;"><a href="${actionUrl}" target="_blank" style="display:inline-block;padding:15px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;font-weight:800;color:${COLORS.white};text-decoration:none;border-radius:14px;">${actionLabel}&nbsp;&nbsp;→</a></td></tr></table>`
    : "";

  const codeBlock = code
    ? `<div style="margin:26px 0;padding:20px;border:1px solid ${COLORS.border};border-radius:16px;background:${COLORS.goldSoft};text-align:center;"><div style="margin-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:800;letter-spacing:2px;color:#8a6c2f;text-transform:uppercase;">Code de vérification</div><div style="font-family:Arial,Helvetica,sans-serif;font-size:31px;line-height:38px;font-weight:900;letter-spacing:8px;color:${COLORS.navy};">${code}</div></div>`
    : "";

  const warningBlock = warning
    ? `<div style="margin-top:24px;padding:16px 18px;border-left:4px solid ${COLORS.gold};border-radius:10px;background:#faf7ef;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#655431;">${warning}</div>`
    : "";

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>LEXIA</title>
  <style>
    @media only screen and (max-width: 640px) {
      .lexia-shell { width: 100% !important; }
      .lexia-card { border-radius: 0 !important; }
      .lexia-pad { padding-left: 22px !important; padding-right: 22px !important; }
      .lexia-title { font-size: 30px !important; line-height: 35px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${COLORS.background};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:${COLORS.background};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0" class="lexia-shell lexia-card" style="width:620px;max-width:620px;background:${COLORS.white};border:1px solid ${COLORS.border};border-radius:26px;overflow:hidden;box-shadow:0 18px 50px rgba(11,34,61,.10);">
          <tr>
            <td class="lexia-pad" style="padding:27px 38px;background:${COLORS.navy};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:34px;font-weight:700;letter-spacing:4px;color:${COLORS.white};">LEXIA<span style="color:${COLORS.gold};">.</span></td>
                  <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:15px;font-weight:800;letter-spacing:1.6px;color:${COLORS.gold};text-transform:uppercase;">Assistance juridique<br><span style="color:#b7c5d4;letter-spacing:.4px;font-weight:600;">Confidentielle et sécurisée</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="height:5px;background:${COLORS.gold};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td class="lexia-pad" style="padding:42px 48px 36px;">
              <div style="margin-bottom:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;font-weight:900;letter-spacing:2px;color:#9a7836;text-transform:uppercase;">${eyebrow}</div>
              <h1 class="lexia-title" style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:44px;font-weight:700;color:${COLORS.navy};">${title}</h1>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:${COLORS.text};">${intro}</p>
              ${content}
              ${codeBlock}
              ${action}
              ${warningBlock}
              <div style="margin-top:30px;padding-top:22px;border-top:1px solid ${COLORS.border};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:${COLORS.muted};">
                <strong style="color:${COLORS.navy};">Conseil de sécurité :</strong> LEXIA ne vous demandera jamais votre mot de passe, vos codes de connexion ou vos coordonnées bancaires par e-mail.
              </div>
            </td>
          </tr>
          <tr>
            <td class="lexia-pad" style="padding:24px 38px;background:#f8fafc;border-top:1px solid ${COLORS.border};">
              <p style="margin:0 0 7px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:${COLORS.muted};">${footerNote}</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:#8994a3;">LEXIA — Plateforme d’assistance juridique en ligne · <a href="{{ .SiteURL }}" style="color:#8a6c2f;text-decoration:none;font-weight:700;">Accéder à la plateforme</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const detail = (label: string, value: string) => `<div style="margin-top:22px;padding:16px 18px;border:1px solid ${COLORS.border};border-radius:14px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;"><div style="font-size:10px;line-height:15px;font-weight:900;letter-spacing:1.5px;color:#9a7836;text-transform:uppercase;">${label}</div><div style="margin-top:5px;font-size:14px;line-height:22px;font-weight:700;color:${COLORS.navy};word-break:break-word;">${value}</div></div>`;

export const lexiaEmailTemplates: LexiaEmailTemplate[] = [
  {
    id: "confirmation",
    label: "Confirmation d’inscription",
    category: "auth",
    supabaseTemplate: "Confirm signup",
    subject: "Confirmez votre inscription à LEXIA",
    description: "Envoyé immédiatement après la création d’un compte client.",
    html: emailLayout({
      preheader: "Confirmez votre adresse e-mail pour activer votre espace LEXIA.",
      eyebrow: "Activation de votre espace",
      title: "Bienvenue sur LEXIA.",
      intro: "Votre compte a bien été créé. Confirmez maintenant votre adresse e-mail pour accéder à votre espace confidentiel et commencer vos démarches.",
      actionLabel: "Confirmer mon inscription",
      actionUrl: "{{ .ConfirmationURL }}",
      code: "{{ .Token }}",
      warning: "Ce lien et ce code sont personnels et temporaires. Si vous n’êtes pas à l’origine de cette inscription, ignorez simplement ce message.",
    }),
  },
  {
    id: "recovery",
    label: "Mot de passe oublié",
    category: "auth",
    supabaseTemplate: "Reset password",
    subject: "Réinitialisez votre mot de passe LEXIA",
    description: "Permet au client de choisir un nouveau mot de passe.",
    html: emailLayout({
      preheader: "Une demande de réinitialisation de votre mot de passe LEXIA a été reçue.",
      eyebrow: "Sécurité du compte",
      title: "Choisissez un nouveau mot de passe.",
      intro: "Nous avons reçu une demande de réinitialisation pour votre compte LEXIA. Utilisez le bouton ci-dessous pour définir un nouveau mot de passe sécurisé.",
      actionLabel: "Réinitialiser mon mot de passe",
      actionUrl: "{{ .ConfirmationURL }}",
      code: "{{ .Token }}",
      warning: "Vous n’avez pas demandé cette opération ? Ne cliquez sur aucun lien : votre mot de passe actuel reste inchangé.",
    }),
  },
  {
    id: "invite",
    label: "Invitation utilisateur",
    category: "auth",
    supabaseTemplate: "Invite user",
    subject: "Votre invitation à rejoindre LEXIA",
    description: "Invitation d’un client, juriste ou membre de l’équipe.",
    html: emailLayout({
      preheader: "Vous êtes invité à créer votre espace sécurisé LEXIA.",
      eyebrow: "Invitation personnelle",
      title: "Votre espace LEXIA vous attend.",
      intro: "Vous avez été invité à rejoindre la plateforme LEXIA. Acceptez cette invitation pour créer vos accès et découvrir l’espace qui vous a été réservé.",
      actionLabel: "Accepter l’invitation",
      actionUrl: "{{ .ConfirmationURL }}",
      code: "{{ .Token }}",
      warning: "Cette invitation est nominative. Ne transférez pas cet e-mail à une autre personne.",
    }),
  },
  {
    id: "magic-link",
    label: "Lien de connexion",
    category: "auth",
    supabaseTemplate: "Magic link",
    subject: "Votre lien de connexion sécurisé LEXIA",
    description: "Connexion sans mot de passe, valable une seule fois.",
    html: emailLayout({
      preheader: "Utilisez ce lien sécurisé pour vous connecter à LEXIA.",
      eyebrow: "Connexion sécurisée",
      title: "Accédez à votre espace.",
      intro: "Cliquez sur le bouton ci-dessous pour vous connecter à LEXIA. Ce lien est personnel, temporaire et ne peut être utilisé qu’une seule fois.",
      actionLabel: "Ouvrir mon espace LEXIA",
      actionUrl: "{{ .ConfirmationURL }}",
      code: "{{ .Token }}",
      warning: "Si vous n’avez pas demandé ce lien de connexion, vous pouvez ignorer cet e-mail en toute sécurité.",
    }),
  },
  {
    id: "email-change",
    label: "Changement d’adresse e-mail",
    category: "auth",
    supabaseTemplate: "Change email address",
    subject: "Confirmez votre nouvelle adresse e-mail LEXIA",
    description: "Validation de la nouvelle adresse demandée par le client.",
    html: emailLayout({
      preheader: "Confirmez la nouvelle adresse e-mail associée à votre compte LEXIA.",
      eyebrow: "Modification de vos accès",
      title: "Confirmez votre nouvelle adresse.",
      intro: "Une demande de modification de l’adresse e-mail de votre compte a été enregistrée.",
      content: detail("Nouvelle adresse", "{{ .NewEmail }}"),
      actionLabel: "Confirmer cette adresse",
      actionUrl: "{{ .ConfirmationURL }}",
      code: "{{ .Token }}",
      warning: "Vous n’êtes pas à l’origine de cette demande ? Ne confirmez pas la modification et contactez l’assistance LEXIA.",
    }),
  },
  {
    id: "reauthentication",
    label: "Code de sécurité",
    category: "auth",
    supabaseTemplate: "Reauthentication",
    subject: "{{ .Token }} — Votre code de sécurité LEXIA",
    description: "Vérification renforcée avant une action sensible.",
    html: emailLayout({
      preheader: "Votre code temporaire de vérification LEXIA.",
      eyebrow: "Vérification d’identité",
      title: "Confirmez que c’est bien vous.",
      intro: "Une opération sensible nécessite une vérification supplémentaire. Saisissez le code ci-dessous dans LEXIA pour continuer.",
      code: "{{ .Token }}",
      warning: "Ce code expire rapidement. Ne le communiquez à personne, y compris à un membre supposé de l’équipe LEXIA.",
    }),
  },
  {
    id: "password-changed",
    label: "Mot de passe modifié",
    category: "security",
    supabaseTemplate: "Password changed notification",
    subject: "Votre mot de passe LEXIA a été modifié",
    description: "Alerte de sécurité après modification du mot de passe.",
    html: emailLayout({
      preheader: "Le mot de passe de votre compte LEXIA vient d’être modifié.",
      eyebrow: "Alerte de sécurité",
      title: "Votre mot de passe a été modifié.",
      intro: "Nous vous confirmons que le mot de passe associé à votre compte LEXIA vient d’être changé.",
      content: detail("Compte concerné", "{{ .Email }}"),
      warning: "Vous n’avez pas effectué cette modification ? Réinitialisez immédiatement votre mot de passe et contactez l’assistance.",
    }),
  },
  {
    id: "email-changed",
    label: "Adresse e-mail modifiée",
    category: "security",
    supabaseTemplate: "Email address changed notification",
    subject: "L’adresse e-mail de votre compte LEXIA a été modifiée",
    description: "Alerte envoyée après la modification effective de l’adresse.",
    html: emailLayout({
      preheader: "L’adresse e-mail de votre compte LEXIA a changé.",
      eyebrow: "Alerte de sécurité",
      title: "Votre adresse e-mail a été modifiée.",
      intro: "Nous vous confirmons la modification de l’adresse utilisée pour accéder à votre compte LEXIA.",
      content: `${detail("Ancienne adresse", "{{ .OldEmail }}")}${detail("Nouvelle adresse", "{{ .Email }}")}`,
      warning: "Vous n’avez pas demandé ce changement ? Contactez immédiatement l’assistance LEXIA afin de sécuriser votre compte.",
    }),
  },
  {
    id: "case-received",
    label: "Dossier bien reçu",
    category: "transactional",
    subject: "Votre dossier {{ reference }} a bien été reçu par LEXIA",
    description: "Confirmation transactionnelle après le dépôt d’un dossier.",
    html: emailLayout({
      preheader: "Votre dossier juridique a bien été transmis à LEXIA.",
      eyebrow: "Dossier enregistré",
      title: "Votre demande est entre de bonnes mains.",
      intro: "Votre dossier a bien été enregistré. Notre équipe peut désormais consulter les informations et documents que vous avez transmis.",
      content: `${detail("Référence du dossier", "{{ reference }}")}${detail("Objet", "{{ subject }}")}`,
      actionLabel: "Suivre mon dossier",
      actionUrl: "{{ case_url }}",
      warning: "Conservez votre référence : elle permettra d’identifier rapidement votre demande lors de vos échanges avec LEXIA.",
    }),
  },
  {
    id: "case-status",
    label: "Évolution d’un dossier",
    category: "transactional",
    subject: "Mise à jour de votre dossier {{ reference }}",
    description: "Notification lorsqu’un statut ou une action administrative change.",
    html: emailLayout({
      preheader: "Une nouvelle action a été enregistrée sur votre dossier LEXIA.",
      eyebrow: "Suivi transparent",
      title: "Votre dossier vient d’évoluer.",
      intro: "Une nouvelle action a été enregistrée par l’équipe LEXIA. Consultez votre espace pour découvrir le détail et les éventuelles démarches attendues.",
      content: `${detail("Dossier", "{{ reference }}")}${detail("Nouveau statut", "{{ status_label }}")}`,
      actionLabel: "Consulter la chronologie",
      actionUrl: "{{ case_url }}",
    }),
  },
  {
    id: "new-message",
    label: "Nouvelle réponse",
    category: "transactional",
    subject: "Vous avez reçu une nouvelle réponse sur LEXIA",
    description: "Préviens le client d’un nouveau message lié à son dossier.",
    html: emailLayout({
      preheader: "Une nouvelle réponse est disponible dans votre espace LEXIA.",
      eyebrow: "Nouveau message",
      title: "Notre équipe vous a répondu.",
      intro: "Une nouvelle réponse concernant votre demande est disponible dans la conversation sécurisée de votre dossier.",
      content: detail("Dossier concerné", "{{ reference }}"),
      actionLabel: "Lire la réponse",
      actionUrl: "{{ conversation_url }}",
      warning: "Pour préserver la confidentialité de vos échanges, le contenu complet du message est uniquement visible dans votre espace sécurisé.",
    }),
  },
  {
    id: "payment-confirmed",
    label: "Paiement confirmé",
    category: "transactional",
    subject: "Paiement confirmé pour votre dossier LEXIA",
    description: "Reçu de confirmation lorsque Stripe sera activé.",
    html: emailLayout({
      preheader: "Votre paiement LEXIA a bien été confirmé.",
      eyebrow: "Paiement sécurisé",
      title: "Votre paiement est confirmé.",
      intro: "Votre règlement a été validé de manière sécurisée. Le traitement de votre dossier peut désormais se poursuivre selon la prestation choisie.",
      content: `${detail("Dossier", "{{ reference }}")}${detail("Montant réglé", "{{ amount }}")}`,
      actionLabel: "Voir mon dossier",
      actionUrl: "{{ case_url }}",
      footerNote: "Cet e-mail confirme uniquement la réception du paiement. La facture sera disponible dans votre espace client.",
    }),
  },
];

export const emailCategoryLabels = {
  auth: "Authentification",
  security: "Sécurité",
  transactional: "Dossiers et paiements",
} as const;
