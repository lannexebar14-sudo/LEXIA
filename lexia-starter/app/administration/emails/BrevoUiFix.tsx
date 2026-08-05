"use client";

import { useEffect } from "react";

const SENDER_LABEL = "LEXIA <thieryvalentin2@gmail.com>";
const NETWORK_MESSAGE = "Brevo bloque encore une adresse IP dynamique de Supabase. Dans Brevo, autorisez une seule fois la plage 2a05:d012:fca:9500::/60, puis relancez l’envoi.";

export default function BrevoUiFix() {
  useEffect(() => {
    function refreshVisibleLabels() {
      const sender = document.querySelector<HTMLElement>(".admin-email-sender b");
      if (sender && sender.textContent !== SENDER_LABEL) sender.textContent = SENDER_LABEL;

      const security = document.querySelector<HTMLElement>(".admin-email-security");
      if (security && /Resend/i.test(security.textContent || "")) {
        security.textContent = "⌾ La clé Brevo reste chiffrée côté serveur et n’est jamais exposée au navigateur.";
      }

      const error = document.querySelector<HTMLElement>(".admin-email-feedback.error");
      if (error && /clé API Brevo est invalide|connexion Brevo n’a pas pu être vérifiée/i.test(error.textContent || "")) {
        error.textContent = NETWORK_MESSAGE;
      }
    }

    refreshVisibleLabels();
    const observer = new MutationObserver(refreshVisibleLabels);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
